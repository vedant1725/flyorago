import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CommunityService,
  CommunityGroup,
  CommunityPost,
  PostCategory,
  PostComment,
} from '../../services/community';
import { useAuth } from '../../context/AuthContext';
import { AppAlert as Alert } from '../../components/AppAlertModal';
import { getSafeHeaderPaddingTop, getSafeBottomPadding } from '../../constants/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_LABELS: Record<PostCategory, { label: string; icon: any; color: string }> = {
  UPCOMING_TRAVEL: { label: 'Upcoming Travel', icon: 'airplane', color: '#089A8D' },
  TRAVEL_EXPERIENCE: { label: 'Travel Experience', icon: 'compass', color: '#3B82F6' },
  AVAILABLE_ROUTE: { label: 'Available Route', icon: 'map', color: '#10B981' },
  PARCEL_REQUIREMENT: { label: 'Parcel Requirement', icon: 'cube', color: '#F59E0B' },
  SUCCESS_STORY: { label: 'Delivery Story', icon: 'star', color: '#8B5CF6' },
  TRAVEL_TIPS: { label: 'Travel Tips', icon: 'bulb', color: '#EC4899' },
  FLYORA_EXPERIENCE: { label: 'Flyorago Story', icon: 'sparkles', color: '#14B8A6' },
};

interface CommunityScreenProps {
  onOpenChatWithUser?: (userId: number, userName: string) => void;
  onNavigateToTrips?: () => void;
  onNavigateToShipments?: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  onOpenChatWithUser,
  onNavigateToTrips,
  onNavigateToShipments,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Top Sub-Tabs: 'feed' | 'cities' | 'routes' | 'saved'
  const [activeTab, setActiveTab] = useState<'feed' | 'cities' | 'routes' | 'saved'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);

  // Data states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [postCategory, setPostCategory] = useState<PostCategory>('UPCOMING_TRAVEL');
  const [postOrigin, setPostOrigin] = useState<string>('');
  const [postDest, setPostDest] = useState<string>('');
  const [postCapacity, setPostCapacity] = useState<string>('');
  const [selectedGroupIdForPost, setSelectedGroupIdForPost] = useState<number | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);

  // Comments Modal State
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);

  // Guidelines / Filter Modal State
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  // Fetch Groups
  const fetchGroups = useCallback(async () => {
    try {
      const res = await CommunityService.getGroups();
      if (res.success && res.data?.groups) {
        setGroups(res.data.groups);
        if (!selectedGroupIdForPost && res.data.groups.length > 0) {
          setSelectedGroupIdForPost(res.data.groups[0].id);
        }
      }
    } catch (e) {
      // silent
    }
  }, [selectedGroupIdForPost]);

  // Fetch Posts
  const fetchPosts = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const options: any = {};
      if (selectedGroup) options.groupId = selectedGroup.id;
      if (selectedCategory !== 'ALL') options.category = selectedCategory;
      if (activeTab === 'saved') options.tab = 'saved';
      if (searchQuery.trim()) options.search = searchQuery.trim();

      const res = await CommunityService.getPosts(options);
      if (res.success && res.data?.posts) {
        setPosts(res.data.posts);
      }
    } catch (e) {
      // silent
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedGroup, selectedCategory, activeTab, searchQuery]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Toggle Join Group
  const handleToggleJoin = async (group: CommunityGroup) => {
    try {
      const res = await CommunityService.toggleJoinGroup(group.id);
      if (res.success && res.data) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, is_joined: res.data!.joined, members_count: res.data!.members_count }
              : g
          )
        );
        if (selectedGroup && selectedGroup.id === group.id) {
          setSelectedGroup((prev) =>
            prev ? { ...prev, is_joined: res.data!.joined, members_count: res.data!.members_count } : null
          );
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to update group membership.');
    }
  };

  // Toggle Like Post
  const handleToggleLike = async (post: CommunityPost) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      const res = await CommunityService.toggleLikePost(post.id);
      if (!res.success) {
        // Rollback
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, is_liked: post.is_liked, likes_count: post.likes_count } : p))
        );
      }
    } catch (e) {
      // Rollback
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_liked: post.is_liked, likes_count: post.likes_count } : p))
      );
    }
  };

  // Toggle Save Post
  const handleToggleSave = async (post: CommunityPost) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              is_saved: !p.is_saved,
              saves_count: p.is_saved ? Math.max(0, p.saves_count - 1) : p.saves_count + 1,
            }
          : p
      )
    );

    try {
      await CommunityService.toggleSavePost(post.id);
    } catch (e) {
      // silent
    }
  };

  // Follow User
  const handleToggleFollow = async (authorId: number, authorName: string) => {
    try {
      const res = await CommunityService.toggleFollowUser(authorId);
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p.author.id === authorId
              ? { ...p, author: { ...p.author, is_following: res.data!.is_following } }
              : p
          )
        );
        Alert.alert(
          res.data.is_following ? 'Following' : 'Unfollowed',
          res.data.is_following
            ? `You are now following ${authorName}.`
            : `You unfollowed ${authorName}.`
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update follow status.');
    }
  };

  // Report Post
  const handleReportPost = (post: CommunityPost) => {
    Alert.alert(
      'Report Post',
      'Does this post violate Flyorago community guidelines (spam, fake travel, inappropriate content)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report Spam',
          style: 'destructive',
          onPress: async () => {
            const res = await CommunityService.reportPost(post.id, 'SPAM');
            if (res.success) {
              Alert.alert('Flagged', 'Post has been submitted for admin moderation.');
            }
          },
        },
      ]
    );
  };

  // Share Post
  const handleSharePost = async (post: CommunityPost) => {
    try {
      await Share.share({
        title: post.title,
        message: `[Flyorago Community] ${post.title}\n\n${post.content}\n\nJoin verified travelers & parcel senders on Flyorago!`,
      });
    } catch (e) {
      // silent
    }
  };

  // Open Comments
  const handleOpenComments = async (post: CommunityPost) => {
    setActiveCommentPost(post);
    setIsLoadingComments(true);
    try {
      const res = await CommunityService.getComments(post.id);
      if (res.success && res.data?.comments) {
        setComments(res.data.comments);
      }
    } catch (e) {
      // silent
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Submit Comment
  const handleSendComment = async () => {
    if (!commentText.trim() || !activeCommentPost) return;
    try {
      const res = await CommunityService.addComment(activeCommentPost.id, commentText.trim());
      if (res.success && res.data) {
        setComments((prev) => [...prev, res.data!.comment]);
        setCommentText('');
        // Update post comment count
        setPosts((prev) =>
          prev.map((p) =>
            p.id === activeCommentPost.id
              ? { ...p, comments_count: res.data!.comments_count }
              : p
          )
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to post comment.');
    }
  };

  // Submit New Post
  const handleSubmitNewPost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !selectedGroupIdForPost) {
      Alert.alert('Required Fields', 'Please enter a post title, content, and select a community.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const payload: any = {
        group: selectedGroupIdForPost,
        category: postCategory,
        title: postTitle.trim(),
        content: postContent.trim(),
      };
      if (postOrigin.trim()) payload.origin_city = postOrigin.trim();
      if (postDest.trim()) payload.destination_city = postDest.trim();
      if (postCapacity.trim() && !isNaN(Number(postCapacity))) {
        payload.available_capacity_kg = Number(postCapacity);
      }

      const res = await CommunityService.createPost(payload);
      if (res.success && res.data?.post) {
        Alert.alert('Success', 'Your post is now live in the community!');
        setShowCreateModal(false);
        setPostTitle('');
        setPostContent('');
        setPostOrigin('');
        setPostDest('');
        setPostCapacity('');
        fetchPosts(true);
      } else {
        Alert.alert('Post Failed', res.message || 'Please check your inputs.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to publish post.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Render Post Card
  const renderPostCard = ({ item }: { item: CommunityPost }) => {
    const catConfig = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.UPCOMING_TRAVEL;
    const isCurrentUser = user && (String(user.id) === String(item.author.id) || user.email === item.author.email);

    return (
      <View style={styles.postCard}>
        {/* Author Header Row */}
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarLetter}>
              {(item.author.full_name || item.author.email)[0].toUpperCase()}
            </Text>
          </View>

          <View style={styles.authorMeta}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {item.author.full_name}
              </Text>

              {/* Verified Badges */}
              {item.author.is_verified_traveler && (
                <View style={styles.verifiedTravelerBadge}>
                  <Ionicons name="airplane" size={10} color="#089A8D" />
                  <Text style={styles.verifiedBadgeText}>Verified Traveler</Text>
                </View>
              )}
              {item.author.is_verified_sender && !item.author.is_verified_traveler && (
                <View style={styles.verifiedSenderBadge}>
                  <Ionicons name="cube" size={10} color="#3B82F6" />
                  <Text style={styles.verifiedSenderBadgeText}>Verified Sender</Text>
                </View>
              )}
            </View>

            <View style={styles.groupBreadcrumb}>
              <Ionicons name="people-outline" size={11} color="#64748B" />
              <Text style={styles.groupBreadcrumbText}>{item.group_name}</Text>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.timeAgoText}>
                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Action Options (Follow / Report) */}
          <View style={styles.headerRightActions}>
            {!isCurrentUser && (
              <TouchableOpacity
                style={[styles.followBtn, item.author.is_following && styles.followingBtn]}
                onPress={() => handleToggleFollow(item.author.id, item.author.full_name)}
                activeOpacity={0.7}
              >
                <Text style={[styles.followBtnText, item.author.is_following && styles.followingBtnText]}>
                  {item.author.is_following ? 'Following' : '+ Follow'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => handleReportPost(item)}
              activeOpacity={0.6}
            >
              <Ionicons name="ellipsis-vertical" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Pill Tag */}
        <View style={styles.categoryPillWrap}>
          <View style={[styles.categoryPill, { backgroundColor: `${catConfig.color}15`, borderColor: `${catConfig.color}40` }]}>
            <Ionicons name={catConfig.icon} size={12} color={catConfig.color} />
            <Text style={[styles.categoryPillText, { color: catConfig.color }]}>
              {catConfig.label}
            </Text>
          </View>

          {/* Route Tags if present */}
          {item.origin_city && item.destination_city && (
            <View style={styles.routeTagPill}>
              <Text style={styles.routeTagText}>
                {item.origin_city} → {item.destination_city}
              </Text>
            </View>
          )}

          {item.available_capacity_kg && (
            <View style={styles.capacityTagPill}>
              <Ionicons name="briefcase-outline" size={11} color="#0D9488" />
              <Text style={styles.capacityTagText}>{item.available_capacity_kg} kg available</Text>
            </View>
          )}
        </View>

        {/* Post Title & Content */}
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Quick Direct Connect CTA for Travelers / Senders */}
        {!isCurrentUser && onOpenChatWithUser && (
          <View style={styles.directConnectBar}>
            <View style={styles.directConnectTextWrap}>
              <Ionicons name="shield-checkmark" size={14} color="#089A8D" />
              <Text style={styles.directConnectNotice}>Official Flyorago Protected Handover</Text>
            </View>
            <TouchableOpacity
              style={styles.connectChatBtn}
              onPress={() => onOpenChatWithUser(item.author.id, item.author.full_name)}
              activeOpacity={0.75}
            >
              <Ionicons name="chatbubbles" size={13} color="#FFFFFF" />
              <Text style={styles.connectChatBtnText}>Chat & Match</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Interaction Bar (Like, Comment, Save, Share) */}
        <View style={styles.interactionBar}>
          <TouchableOpacity
            style={styles.interactBtn}
            onPress={() => handleToggleLike(item)}
            activeOpacity={0.65}
          >
            <Ionicons
              name={item.is_liked ? 'heart' : 'heart-outline'}
              size={18}
              color={item.is_liked ? '#EF4444' : '#64748B'}
            />
            <Text style={[styles.interactCount, item.is_liked && { color: '#EF4444' }]}>
              {item.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactBtn}
            onPress={() => handleOpenComments(item)}
            activeOpacity={0.65}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#64748B" />
            <Text style={styles.interactCount}>{item.comments_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactBtn}
            onPress={() => handleToggleSave(item)}
            activeOpacity={0.65}
          >
            <Ionicons
              name={item.is_saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={item.is_saved ? '#089A8D' : '#64748B'}
            />
            <Text style={[styles.interactCount, item.is_saved && { color: '#089A8D' }]}>
              {item.saves_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactBtn}
            onPress={() => handleSharePost(item)}
            activeOpacity={0.65}
          >
            <Ionicons name="share-social-outline" size={18} color="#64748B" />
            <Text style={styles.interactCount}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Group Directory Card
  const renderGroupCard = ({ item }: { item: CommunityGroup }) => {
    const isSelected = selectedGroup?.id === item.id;
    return (
      <View style={[styles.groupCard, isSelected && styles.groupCardSelected]}>
        <View style={styles.groupCardIconWrap}>
          <Ionicons
            name={item.group_type === 'ROUTE' ? 'navigate' : (item.icon_name as any || 'globe-outline')}
            size={22}
            color="#089A8D"
          />
        </View>

        <View style={styles.groupCardInfo}>
          <View style={styles.groupCardTitleRow}>
            <Text style={styles.groupCardTitle}>{item.name}</Text>
            <View style={styles.groupTypePill}>
              <Text style={styles.groupTypePillText}>{item.group_type}</Text>
            </View>
          </View>

          <Text style={styles.groupCardDesc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.groupCardStatsRow}>
            <Text style={styles.groupCardStats}>
              <Ionicons name="people" size={12} color="#64748B" /> {item.members_count} members
            </Text>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.groupCardStats}>
              <Ionicons name="newspaper" size={12} color="#64748B" /> {item.posts_count} posts
            </Text>
          </View>
        </View>

        <View style={styles.groupCardActions}>
          <TouchableOpacity
            style={[styles.groupJoinBtn, item.is_joined && styles.groupJoinedBtn]}
            onPress={() => handleToggleJoin(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.groupJoinBtnText, item.is_joined && styles.groupJoinedBtnText]}>
              {item.is_joined ? 'Joined ✓' : '+ Join'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.groupViewFeedBtn}
            onPress={() => {
              setSelectedGroup(isSelected ? null : item);
              setActiveTab('feed');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.groupViewFeedText}>
              {isSelected ? 'Clear Filter' : 'View Feed'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const cityGroups = groups.filter((g) => g.group_type === 'CITY');
  const routeGroups = groups.filter((g) => g.group_type === 'ROUTE');

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <LinearGradient
        colors={['#033D37', '#089A8D', '#14B8A6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={[styles.topHeader, { paddingTop: getSafeHeaderPaddingTop(insets.top) }]}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <View style={styles.headerTagRow}>
              <Ionicons name="sparkles" size={14} color="#2DD4BF" />
              <Text style={styles.headerTagText}>VERIFIED TRAVEL & PARCEL NETWORK</Text>
            </View>
            <Text style={styles.headerMainTitle}>Flyorago Community</Text>
          </View>

          <View style={styles.headerActionRow}>
            <TouchableOpacity
              style={styles.guidelineIconBtn}
              onPress={() => setShowGuidelines(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newPostHeaderBtn}
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#089A8D" />
              <Text style={styles.newPostHeaderText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search upcoming trips, parcel requests, routes..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchPosts()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'feed' && styles.tabItemActive]}
            onPress={() => setActiveTab('feed')}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles" size={15} color={activeTab === 'feed' ? '#089A8D' : '#E2E8F0'} />
            <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'cities' && styles.tabItemActive]}
            onPress={() => setActiveTab('cities')}
            activeOpacity={0.7}
          >
            <Ionicons name="business" size={15} color={activeTab === 'cities' ? '#089A8D' : '#E2E8F0'} />
            <Text style={[styles.tabText, activeTab === 'cities' && styles.tabTextActive]}>Cities ({cityGroups.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'routes' && styles.tabItemActive]}
            onPress={() => setActiveTab('routes')}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={15} color={activeTab === 'routes' ? '#089A8D' : '#E2E8F0'} />
            <Text style={[styles.tabText, activeTab === 'routes' && styles.tabTextActive]}>Routes ({routeGroups.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]}
            onPress={() => setActiveTab('saved')}
            activeOpacity={0.7}
          >
            <Ionicons name="bookmark" size={15} color={activeTab === 'saved' ? '#089A8D' : '#E2E8F0'} />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>Saved</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Selected Group Filter Bar */}
      {selectedGroup && activeTab === 'feed' && (
        <View style={styles.activeFilterBar}>
          <Ionicons name="funnel" size={13} color="#089A8D" />
          <Text style={styles.activeFilterText}>
            Showing: <Text style={{ fontWeight: '800' }}>{selectedGroup.name}</Text>
          </Text>
          <TouchableOpacity onPress={() => setSelectedGroup(null)} style={styles.clearFilterBtn}>
            <Text style={styles.clearFilterText}>Clear</Text>
            <Ionicons name="close-circle" size={14} color="#089A8D" />
          </TouchableOpacity>
        </View>
      )}

      {/* Category Pills (Only on Feed & Saved tab) */}
      {(activeTab === 'feed' || activeTab === 'saved') && (
        <View style={styles.categoryHorizontalWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            <TouchableOpacity
              style={[styles.filterCategoryChip, selectedCategory === 'ALL' && styles.filterCategoryChipActive]}
              onPress={() => setSelectedCategory('ALL')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterCategoryText, selectedCategory === 'ALL' && styles.filterCategoryTextActive]}>
                All Posts
              </Text>
            </TouchableOpacity>

            {(Object.keys(CATEGORY_LABELS) as PostCategory[]).map((cat) => {
              const conf = CATEGORY_LABELS[cat];
              const isCatActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterCategoryChip, isCatActive && styles.filterCategoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={conf.icon} size={12} color={isCatActive ? '#FFFFFF' : conf.color} />
                  <Text style={[styles.filterCategoryText, isCatActive && styles.filterCategoryTextActive]}>
                    {conf.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Body Views */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#089A8D" />
          <Text style={styles.loadingCaption}>Connecting to Flyorago Community...</Text>
        </View>
      ) : activeTab === 'cities' ? (
        <FlatList
          data={cityGroups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroupCard}
          contentContainerStyle={[styles.listContainer, { paddingBottom: getSafeBottomPadding(insets.bottom) + 80 }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchGroups()} colors={['#089A8D']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={42} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No city communities found</Text>
            </View>
          }
        />
      ) : activeTab === 'routes' ? (
        <FlatList
          data={routeGroups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroupCard}
          contentContainerStyle={[styles.listContainer, { paddingBottom: getSafeBottomPadding(insets.bottom) + 80 }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchGroups()} colors={['#089A8D']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="navigate-outline" size={42} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No route communities found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPostCard}
          contentContainerStyle={[styles.listContainer, { paddingBottom: getSafeBottomPadding(insets.bottom) + 80 }]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchPosts(true)} colors={['#089A8D']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={46} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>
                {activeTab === 'saved' ? 'No saved posts yet' : 'No posts in this community yet'}
              </Text>
              <Text style={styles.emptySub}>
                Be the first traveler or sender to share your upcoming trip or delivery story!
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>Create Community Post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Floating Action Button to Create Post */}
      <TouchableOpacity
        style={[styles.fabBtn, { bottom: getSafeBottomPadding(insets.bottom) + 84 }]}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#033D37', '#089A8D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.fabText}>New Post</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* MODAL: Create New Community Post */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Create Community Post</Text>
                <Text style={styles.modalSub}>Share trips, parcel needs or delivery stories</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Select Community */}
              <Text style={styles.fieldLabel}>Select Community *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupPickerScroll}>
                {groups.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.groupPickerPill, selectedGroupIdForPost === g.id && styles.groupPickerPillActive]}
                    onPress={() => setSelectedGroupIdForPost(g.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={g.group_type === 'ROUTE' ? 'navigate' : 'business'}
                      size={13}
                      color={selectedGroupIdForPost === g.id ? '#FFFFFF' : '#089A8D'}
                    />
                    <Text style={[styles.groupPickerText, selectedGroupIdForPost === g.id && styles.groupPickerTextActive]}>
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Select Category */}
              <Text style={styles.fieldLabel}>Post Type / Category *</Text>
              <View style={styles.categoryGrid}>
                {(Object.keys(CATEGORY_LABELS) as PostCategory[]).map((cat) => {
                  const conf = CATEGORY_LABELS[cat];
                  const isCatSelected = postCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryGridItem, isCatSelected && styles.categoryGridItemActive]}
                      onPress={() => setPostCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={conf.icon} size={14} color={isCatSelected ? '#FFFFFF' : conf.color} />
                      <Text style={[styles.categoryGridText, isCatSelected && styles.categoryGridTextActive]}>
                        {conf.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Post Title */}
              <Text style={styles.fieldLabel}>Post Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Traveling Ahmedabad to Mumbai this Sunday (10kg spare)"
                placeholderTextColor="#94A3B8"
                value={postTitle}
                onChangeText={setPostTitle}
              />

              {/* Post Content */}
              <Text style={styles.fieldLabel}>Details & Travel Information *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Share departure details, parcel requirements, tips, or handover locations..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={postContent}
                onChangeText={setPostContent}
              />

              {/* Optional Route Metadata */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>From (City)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ahmedabad"
                    placeholderTextColor="#94A3B8"
                    value={postOrigin}
                    onChangeText={setPostOrigin}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.fieldLabel}>To (City)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Mumbai"
                    placeholderTextColor="#94A3B8"
                    value={postDest}
                    onChangeText={setPostDest}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Available Luggage Space (Kg) - Optional</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 15"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={postCapacity}
                onChangeText={setPostCapacity}
              />

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.submitPostBtn, isSubmittingPost && { opacity: 0.7 }]}
                onPress={handleSubmitNewPost}
                disabled={isSubmittingPost}
                activeOpacity={0.85}
              >
                {isSubmittingPost ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                    <Text style={styles.submitPostBtnText}>Publish to Community</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: Comments */}
      <Modal visible={!!activeCommentPost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Community Comments</Text>
                <Text style={styles.modalSub} numberOfLines={1}>
                  {activeCommentPost?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveCommentPost(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isLoadingComments ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#089A8D" />
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {(item.author.full_name || item.author.email)[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentBody}>
                      <View style={styles.commentHeaderRow}>
                        <Text style={styles.commentAuthorName}>{item.author.full_name}</Text>
                        <Text style={styles.commentDate}>
                          {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                      <Text style={styles.commentContent}>{item.content}</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>No comments yet. Start the conversation!</Text>
                  </View>
                }
              />
            )}

            {/* Comment Input Bar */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Write a helpful travel comment..."
                placeholderTextColor="#94A3B8"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.sendCommentBtn} onPress={handleSendComment} activeOpacity={0.7}>
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Community Guidelines */}
      <Modal visible={showGuidelines} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.guidelinesCard}>
            <View style={styles.guidelinesHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#089A8D" />
              <Text style={styles.guidelinesTitle}>Flyorago Community Guidelines</Text>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.guidelineHeading}>1. Purpose-Driven Travel & Parcel Network</Text>
              <Text style={styles.guidelineText}>
                Posts must be directly related to travel schedules, spare baggage capacity, parcel requirements, travel tips, and delivery experiences. Unrestricted social chatter or off-topic advertising is strictly prohibited.
              </Text>

              <Text style={styles.guidelineHeading}>2. Verified Traveler & Sender Safety</Text>
              <Text style={styles.guidelineText}>
                Always complete transactions and handovers using Flyorago's built-in Traveler OTP and QR Verification system to guarantee payment security and cargo tracking.
              </Text>

              <Text style={styles.guidelineHeading}>3. Anti-Spam & Admin Moderation</Text>
              <Text style={styles.guidelineText}>
                Our AI spam detection and administrative moderation team review flagged posts immediately. Users violating logistics guidelines will have their community access revoked.
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.guidelineCloseBtn} onPress={() => setShowGuidelines(false)}>
              <Text style={styles.guidelineCloseText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFB',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2DD4BF',
    letterSpacing: 0.8,
  },
  headerMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidelineIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  newPostHeaderText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#089A8D',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    marginLeft: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  tabTextActive: {
    color: '#089A8D',
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#0F766E',
    marginLeft: 6,
    flex: 1,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFilterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#089A8D',
  },
  categoryHorizontalWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterCategoryChipActive: {
    backgroundColor: '#089A8D',
  },
  filterCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterCategoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 14,
    gap: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingCaption: {
    marginTop: 12,
    fontSize: 13,
    color: '#089A8D',
    fontWeight: '700',
  },
  // Post Card Styles
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#089A8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  authorMeta: {
    flex: 1,
    marginLeft: 10,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  verifiedTravelerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0D9488',
  },
  verifiedSenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedSenderBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  groupBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  groupBreadcrumbText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  bulletDot: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timeAgoText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followBtn: {
    backgroundColor: '#E6FAF6',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#089A8D',
  },
  followingBtnText: {
    color: '#64748B',
  },
  moreBtn: {
    padding: 4,
  },
  categoryPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  routeTagPill: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  routeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  capacityTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  capacityTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 20,
  },
  postContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 10,
  },
  directConnectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  directConnectTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  directConnectNotice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#089A8D',
  },
  connectChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#089A8D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  connectChatBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  interactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  interactCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  // Group Directory Card Styles
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupCardSelected: {
    borderColor: '#089A8D',
    backgroundColor: '#F0FDFA',
  },
  groupCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupCardInfo: {
    flex: 1,
  },
  groupCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  groupCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  groupTypePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  groupTypePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  groupCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 16,
  },
  groupCardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupCardStats: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  groupCardActions: {
    marginLeft: 10,
    alignItems: 'flex-end',
    gap: 6,
  },
  groupJoinBtn: {
    backgroundColor: '#089A8D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  groupJoinedBtn: {
    backgroundColor: '#E2E8F0',
  },
  groupJoinBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  groupJoinedBtnText: {
    color: '#475569',
  },
  groupViewFeedBtn: {
    paddingVertical: 2,
  },
  groupViewFeedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#089A8D',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#089A8D',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    marginTop: 16,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Floating New Post Button
  fabBtn: {
    position: 'absolute',
    right: 18,
    borderRadius: 25,
    shadowColor: '#089A8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
  },
  fabText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    padding: 18,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  groupPickerScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  groupPickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  groupPickerPillActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  groupPickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  groupPickerTextActive: {
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  categoryGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryGridItemActive: {
    backgroundColor: '#089A8D',
    borderColor: '#089A8D',
  },
  categoryGridText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  categoryGridTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#089A8D',
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  submitPostBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Comments UI
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D9488',
  },
  commentBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthorName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  commentDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  commentContent: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 17,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginRight: 10,
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#089A8D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Guidelines Card
  guidelinesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  guidelineHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#089A8D',
    marginTop: 10,
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  guidelineCloseBtn: {
    backgroundColor: '#089A8D',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 18,
  },
  guidelineCloseText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
