export interface LandingPageStep {
  title: string;
  description: string;
}

export interface LandingPageBenefit {
  title: string;
  description: string;
}

export interface LandingPageFaq {
  question: string;
  answer: string;
}

export interface CorridorDetail {
  originHubs: string[];
  destinationHubs: string[];
  typicalItems: string[];
  customsNotes: string[];
  disclaimer: string;
}

export interface SeoLandingPageConfig {
  slug: string;
  path: string;
  category: 'commercial' | 'sender' | 'traveler' | 'guide' | 'corridor';
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  badge: string;
  h1: string;
  h1Highlight: string;
  subtitle: string;
  audience: 'Senders' | 'Travelers' | 'Senders & Travelers';
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  overviewTitle: string;
  overviewParagraphs: string[];
  benefits: LandingPageBenefit[];
  stepsTitle: string;
  steps: LandingPageStep[];
  trustPoints: string[];
  corridor?: CorridorDetail;
  faqs: LandingPageFaq[];
  relatedPages: { label: string; description: string; to: string }[];
  areaServed?: string[];
  serviceType: string;
}

export const SEO_LANDING_PAGES: SeoLandingPageConfig[] = [
  {
    slug: 'international-package-delivery',
    path: '/international-package-delivery',
    category: 'commercial',
    primaryKeyword: 'international package delivery',
    secondaryKeywords: [
      'peer-to-peer package delivery',
      'travel-based delivery service',
      'crowdsourced delivery service',
      'alternative international shipping'
    ],
    seoTitle: 'International Package Delivery via Verified Travelers | Flyorago',
    metaDescription:
      'Send packages internationally with KYC-verified travelers who have spare luggage space. Escrow-protected payments, open inspection, and OTP delivery confirmation.',
    badge: 'Peer-to-Peer Global Delivery',
    h1: 'International Package Delivery,',
    h1Highlight: 'Powered by Verified Travelers',
    subtitle:
      'Connect directly with identity-verified flyers heading to your destination city. Ship personal items, documents, and gifts with escrow protection and OTP handover.',
    audience: 'Senders & Travelers',
    primaryCta: { label: 'Create Free Account', to: '/signup' },
    secondaryCta: { label: 'See How It Works', to: '/how-it-works' },
    overviewTitle: 'A Smarter Alternative to Traditional International Couriers',
    overviewParagraphs: [
      'Traditional international parcel shipping often involves high minimum weight slabs, volumetric surcharges, and slow warehouse transfers. Flyorago connects senders who need reliable cross-border delivery with verified travelers already flying on commercial routes.',
      'Every traveler and sender completes KYC identity verification, packages remain unsealed until physical inspection at handover, and payments stay locked in Flyorago Escrow until the recipient confirms delivery with a 6-digit OTP.'
    ],
    benefits: [
      {
        title: 'KYC Identity Verification',
        description: 'Government ID and live selfie screening help verify every traveler and sender before matching.'
      },
      {
        title: 'Escrow-Protected Payments',
        description: 'Sender funds stay safely held in Flyorago Escrow and release only after OTP handover confirmation.'
      },
      {
        title: 'Direct Commercial Flight Speed',
        description: 'Parcels travel with passengers on direct routes instead of sitting in multi-stop cargo hubs.'
      },
      {
        title: 'Transparent Terms & Inspection',
        description: 'Weight, route, and pickup details are agreed upfront with mandatory open-package inspection.'
      }
    ],
    stepsTitle: 'How International Package Delivery Works on Flyorago',
    steps: [
      {
        title: 'Post Your Package or Browse Trips',
        description: 'Enter your origin, destination, package weight, and preferred dates to match with verified travelers.'
      },
      {
        title: 'Verify & Fund Escrow',
        description: 'Agree on delivery terms and fund Flyorago Escrow—your money remains protected throughout transit.'
      },
      {
        title: 'Inspect, Fly & Confirm With OTP',
        description: 'The traveler inspects the unsealed item at pickup, flies to the destination, and releases payout only when the recipient provides the 6-digit OTP.'
      }
    ],
    trustPoints: [
      'Mandatory government ID & selfie KYC checks',
      'Zero sealed-box rule: travelers inspect every item before acceptance',
      'Strict enforcement against IATA/customs prohibited goods',
      '24/7 support and dispute resolution backed by escrow'
    ],
    faqs: [
      {
        question: 'How does peer-to-peer international package delivery work?',
        answer:
          'Senders list a package or match with a verified traveler flying the same route. Funds stay in escrow until the traveler inspects the item, carries it in spare luggage allowance, and completes delivery using a 6-digit OTP.'
      },
      {
        question: 'What kinds of items can I send through Flyorago?',
        answer:
          'Common permitted shipments include documents, books, clothing, spectacles, and legal personal gifts. Hazardous goods, liquids, narcotics, weapons, and restricted items are strictly banned.'
      },
      {
        question: 'Is payment safe if a trip is cancelled?',
        answer:
          'Yes. Sender funds are held in Flyorago Escrow and are never released to the traveler until successful delivery confirmation.'
      }
    ],
    relatedPages: [
      { label: 'Send a Package Internationally', description: 'Dedicated workflow and packing checklist for senders.', to: '/send-package-internationally' },
      { label: 'Earn Money While Traveling', description: 'Turn spare luggage space into trip savings.', to: '/travelers-earn-money' },
      { label: 'India to USA Delivery Guide', description: 'Corridor rules and hubs between India and the US.', to: '/india-to-usa' }
    ],
    areaServed: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates'],
    serviceType: 'Peer-to-Peer International Package Delivery Marketplace'
  },
  {
    slug: 'send-package-internationally',
    path: '/send-package-internationally',
    category: 'sender',
    primaryKeyword: 'send package internationally',
    secondaryKeywords: [
      'send parcel with someone traveling',
      'find a traveler to carry a package',
      'affordable international parcel delivery',
      'send small packages abroad'
    ],
    seoTitle: 'Send a Package Internationally With Verified Travelers | Flyorago',
    metaDescription:
      'Need to send documents, gifts, or small packages abroad? Match with KYC-verified travelers on Flyorago with escrow payment protection and OTP handover.',
    badge: 'For International Senders',
    h1: 'Send Packages Internationally',
    h1Highlight: 'With Verified Travelers',
    subtitle:
      'Skip inflated courier minimum charges for lightweight parcels, documents, and personal gifts. Connect with verified flyers already traveling to your destination.',
    audience: 'Senders',
    primaryCta: { label: 'Register to Send a Package', to: '/signup' },
    secondaryCta: { label: 'Read the Sender Guide', to: '/sender-guide' },
    overviewTitle: 'Designed for Personal Parcels, Documents & Urgent Gifts',
    overviewParagraphs: [
      'When you only need to send 1 kg to 10 kg internationally—such as university records, eyeglasses, festive clothing, or family gifts—traditional express couriers can cost more than the item itself.',
      'Flyorago helps you find identity-verified travelers flying your route so your package moves quickly with direct accountability, milestone tracking, and escrow-backed checkout.'
    ],
    benefits: [
      {
        title: 'Lower Cost on Small & Medium Parcels',
        description: 'Avoid commercial volumetric surcharges by sharing existing passenger luggage capacity.'
      },
      {
        title: 'Verified Carrier Profiles',
        description: 'Review KYC status and community ratings before requesting a match.'
      },
      {
        title: 'Escrow Until Recipient OTP',
        description: 'Payment stays protected in Flyorago Escrow until the recipient confirms physical delivery.'
      },
      {
        title: 'Direct Route Matching',
        description: 'Match based on departure airport, arrival city, travel dates, and available weight.'
      }
    ],
    stepsTitle: '3 Simple Steps to Send Your Package Abroad',
    steps: [
      {
        title: 'Sign Up & Complete Verification',
        description: 'Create your Flyorago account and complete quick KYC verification so travelers trust your listing.'
      },
      {
        title: 'List Package Details & Match',
        description: 'Add pickup city, destination, weight, and item description—then request a verified traveler.'
      },
      {
        title: 'Unsealed Handover & OTP Confirmation',
        description: 'Allow the traveler to inspect the items at pickup, track progress, and share the 6-digit OTP upon arrival.'
      }
    ],
    trustPoints: [
      'Keep items unsealed for transparent handover inspection',
      'Check destination customs rules before booking',
      'Funds protected in escrow from booking to OTP release'
    ],
    faqs: [
      {
        question: 'Can I send documents internationally through a traveler?',
        answer:
          'Yes, non-restricted personal or academic documents are one of the most common items sent via Flyorago, provided contents are declared accurately and inspected at handover.'
      },
      {
        question: 'Do I have to seal the package before meeting the traveler?',
        answer:
          'No. For aviation safety and traveler protection, all packages must remain unsealed until the traveler visually inspects the contents at handover.'
      },
      {
        question: 'How do I know my recipient actually received the parcel?',
        answer:
          'Flyorago generates a unique 6-digit OTP handover code. The traveler must enter that OTP at delivery to mark the shipment complete and unlock escrow payout.'
      }
    ],
    relatedPages: [
      { label: 'Sender Guide', description: 'Customs checklist, packing rules, and weight tips.', to: '/sender-guide' },
      { label: 'Escrow Protection', description: 'How your money stays safe until delivery.', to: '/escrow' },
      { label: 'India to UK Parcel Guide', description: 'Everything to know for India-to-UK shipments.', to: '/india-to-uk' }
    ],
    areaServed: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates'],
    serviceType: 'International Parcel Sender Matching'
  },
  {
    slug: 'travelers-earn-money',
    path: '/travelers-earn-money',
    category: 'traveler',
    primaryKeyword: 'earn money while traveling',
    secondaryKeywords: [
      'earn by carrying packages',
      'make money with spare luggage space',
      'share luggage space and earn',
      'traveler delivery opportunities'
    ],
    seoTitle: 'Earn Money While Traveling by Sharing Luggage Space | Flyorago',
    metaDescription:
      'Turn unused airline baggage allowance into extra income on trips you are already taking. Mandatory KYC, physical package inspection, and escrow payouts.',
    badge: 'For International Travelers',
    h1: 'Earn Money While Traveling',
    h1Highlight: 'With Spare Luggage Space',
    subtitle:
      'Already flying internationally with unused kilograms in your suitcase? Publish your itinerary on Flyorago, inspect approved parcels in person, and earn escrow-guaranteed payouts.',
    audience: 'Travelers',
    primaryCta: { label: 'Sign Up & Post Your Trip', to: '/signup' },
    secondaryCta: { label: 'Read the Traveler Guide', to: '/traveler-guide' },
    overviewTitle: 'Offset Flight Costs Without Changing Your Travel Plans',
    overviewParagraphs: [
      'Whether you fly between India and North America, Europe, the Middle East, or Southeast Asia, unused checked baggage space often goes to waste. Flyorago lets verified travelers list available kilograms on flights they already booked.',
      'You stay in complete control: review every sender request, inspect every item unsealed before accepting custody, decline anything uncomfortable, and receive escrow payouts once the recipient verifies the 6-digit OTP.'
    ],
    benefits: [
      {
        title: 'You Choose Every Parcel',
        description: 'Accept only item categories, weights, and pickup locations that fit your schedule.'
      },
      {
        title: 'Mandatory Open Inspection',
        description: 'Inspect every package yourself before packing it—never carry sealed mystery boxes.'
      },
      {
        title: 'Guaranteed Escrow Payouts',
        description: 'Senders fund escrow before pickup so your reward is secured prior to your flight.'
      },
      {
        title: 'Verified Sender Network',
        description: 'All senders must verify their identity with government ID before booking space.'
      }
    ],
    stepsTitle: 'How Travelers Earn on Flyorago',
    steps: [
      {
        title: 'Verify Your Identity & Post Trip',
        description: 'Complete KYC verification and list your departure, destination, travel date, and spare weight.'
      },
      {
        title: 'Review & Inspect Requests',
        description: 'Approve matching sender requests and physically inspect the unsealed item at handover.'
      },
      {
        title: 'Deliver & Unlock Escrow Payout',
        description: 'Meet the recipient, enter the 6-digit handover OTP, and receive your payout.'
      }
    ],
    trustPoints: [
      '100% right to inspect or reject any item at handover',
      'Zero tolerance for prohibited, dangerous, or undeclared goods',
      'Escrow-locked rewards before you depart'
    ],
    faqs: [
      {
        question: 'How much luggage space do I need to share?',
        answer:
          'You decide how many kilograms to list based on your confirmed airline baggage allowance after accounting for your own personal belongings.'
      },
      {
        question: 'Can I refuse a package after seeing it in person?',
        answer:
          'Yes. Travelers always have full authority to inspect contents unsealed and decline any item that violates aviation rules, customs laws, or personal comfort.'
      },
      {
        question: 'When do travelers get paid?',
        answer:
          'Sender payment is held in Flyorago Escrow before travel and released after the recipient confirms delivery using the 6-digit OTP.'
      }
    ],
    relatedPages: [
      { label: 'Carry Packages & Earn', description: 'See safety rules and airline baggage tips for carriers.', to: '/carry-packages-and-earn' },
      { label: 'Traveler Guide', description: 'Full checklist for inspection, customs, and OTP handover.', to: '/traveler-guide' },
      { label: 'Safety & Security', description: 'How Flyorago protects travelers at every milestone.', to: '/safety' }
    ],
    areaServed: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates'],
    serviceType: 'Traveler Luggage Monetization Marketplace'
  },
  {
    slug: 'carry-packages-and-earn',
    path: '/carry-packages-and-earn',
    category: 'traveler',
    primaryKeyword: 'get paid to carry parcels',
    secondaryKeywords: [
      'carry packages while travelling India',
      'traveler luggage delivery',
      'share luggage space and earn'
    ],
    seoTitle: 'Get Paid to Carry Parcels Safely on Flights | Flyorago',
    metaDescription:
      'Carry verified, inspected personal parcels on domestic and international flights and get paid securely through Flyorago Escrow.',
    badge: 'Traveler Carrier Program',
    h1: 'Carry Approved Packages',
    h1Highlight: 'and Earn on Every Trip',
    subtitle:
      'Turn extra baggage capacity into meaningful travel income while helping verified senders move documents, gifts, and essentials across borders.',
    audience: 'Travelers',
    primaryCta: { label: 'Start Earning as a Traveler', to: '/signup' },
    secondaryCta: { label: 'Explore Safety Rules', to: '/safety' },
    overviewTitle: 'Built Around Carrier Control and Aviation Safety',
    overviewParagraphs: [
      'Carrying packages for others only works when safety and transparency come first. Flyorago enforces identity verification for both sides, clear item declarations, and mandatory physical inspection prior to departure.',
      'Whether you travel regularly between Indian metro airports and global hubs or take occasional international trips, you set your available capacity and accept only requests that match your itinerary.'
    ],
    benefits: [
      {
        title: 'Strict Prohibited-Item Screening',
        description: 'Automated filters and clear policies prohibit liquids, dangerous goods, and restricted items.'
      },
      {
        title: 'Flexible Route & Weight Control',
        description: 'Publish only the spare kilograms you are comfortable carrying within airline limits.'
      },
      {
        title: 'OTP-Verified Completion',
        description: 'Proof of handover protects travelers from false non-delivery disputes.'
      },
      {
        title: 'Dedicated Support Team',
        description: 'Reach Trust & Safety support anytime if a schedule or handover changes.'
      }
    ],
    stepsTitle: 'Your Safe Carrying Checklist',
    steps: [
      {
        title: 'Verify Airline Allowance',
        description: 'Check your ticket’s checked and cabin limits before listing spare kilograms.'
      },
      {
        title: 'Inspect Unsealed Contents',
        description: 'Verify every item matches the booking and complies with customs rules.'
      },
      {
        title: 'Complete OTP Handover',
        description: 'Deliver to the verified recipient and collect the 6-digit OTP to release escrow.'
      }
    ],
    trustPoints: [
      'Never accept sealed boxes or last-minute unverified add-ons',
      'Keep lithium batteries in cabin baggage per IATA rules',
      'Payments secured in escrow prior to pickup'
    ],
    faqs: [
      {
        question: 'Is carrying packages on Flyorago available for flights from India?',
        answer:
          'Yes, verified travelers flying internationally from India or returning to India can list spare luggage space on Flyorago, subject to airline and customs compliance.'
      },
      {
        question: 'How is my payout protected?',
        answer:
          'Senders fund Flyorago Escrow before handover, ensuring funds are reserved and released upon valid OTP confirmation.'
      }
    ],
    relatedPages: [
      { label: 'Earn Money While Traveling', description: 'Overview of traveler benefits and trip posting.', to: '/travelers-earn-money' },
      { label: 'Traveler Guide', description: 'Step-by-step customs and inspection handbook.', to: '/traveler-guide' },
      { label: 'Prohibited Items Blog', description: 'Detailed list of banned and restricted goods.', to: '/blog/prohibited-and-restricted-items-international-travel-delivery' }
    ],
    areaServed: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates'],
    serviceType: 'Peer-to-Peer Traveler Parcel Carrying'
  },
  {
    slug: 'sender-guide',
    path: '/sender-guide',
    category: 'guide',
    primaryKeyword: 'how to send package with traveler',
    secondaryKeywords: [
      'sender guide international delivery',
      'prepare package for international traveler',
      'escrow package delivery guide'
    ],
    seoTitle: 'International Sender Guide: Packing, Customs & Escrow | Flyorago',
    metaDescription:
      'Complete Flyorago Sender Guide: learn how to declare items accurately, prepare unsealed packages for traveler inspection, check customs rules, and confirm OTP delivery.',
    badge: 'Official Sender Handbook',
    h1: 'The Complete',
    h1Highlight: 'International Sender Guide',
    subtitle:
      'Prepare your shipment smoothly: item eligibility, accurate weight measurement, customs declarations, unsealed handover, and escrow OTP protection.',
    audience: 'Senders',
    primaryCta: { label: 'Create Sender Account', to: '/signup' },
    secondaryCta: { label: 'Review Safety Standards', to: '/safety' },
    overviewTitle: 'Set Your Shipment Up for Smooth Matching and Fast Handover',
    overviewParagraphs: [
      'Well-prepared package listings match faster with verified travelers. Travelers prioritize senders who specify exact dimensions, honest weight, clear item categories, and flexible public handover windows.',
      'Remember that commercial passenger flights follow strict aviation security rules. Taking five minutes to check prohibited items and destination customs limits prevents airport delays or refused handovers.'
    ],
    benefits: [
      {
        title: 'Accurate Weight & Dimensions',
        description: 'Weigh items on a digital luggage scale so travelers know exact suitcase space needed.'
      },
      {
        title: 'Unsealed Handover Readiness',
        description: 'Bring tape or a resealable pouch so the traveler can inspect items before sealing.'
      },
      {
        title: 'Customs Transparency',
        description: 'Provide retail receipts or gift notes when appropriate for destination border checks.'
      },
      {
        title: 'Recipient OTP Coordination',
        description: 'Ensure the recipient has the 6-digit OTP ready for quick handover at arrival.'
      }
    ],
    stepsTitle: 'Sender Preparation Workflow',
    steps: [
      {
        title: 'Verify Item Eligibility',
        description: 'Confirm your parcel contains no liquids, hazardous goods, or restricted items.'
      },
      {
        title: 'List & Match Verified Traveler',
        description: 'Create a detailed listing and select a KYC-verified traveler flying your route.'
      },
      {
        title: 'Inspect, Fund Escrow & Track',
        description: 'Fund escrow, complete open inspection at handover, and verify delivery via OTP.'
      }
    ],
    trustPoints: [
      '100% escrow hold until OTP confirmation',
      'KYC verified travelers only',
      'Clear prohibited goods enforcement'
    ],
    faqs: [
      {
        question: 'Should I pack my box tightly before meeting the traveler?',
        answer:
          'Pack items neatly in protective wrapping, but leave the outer box or bag unsealed so the traveler can inspect every item in person before sealing.'
      },
      {
        question: 'Who is responsible for customs duties if applicable?',
        answer:
          'Senders and travelers must ensure items comply with personal allowance and customs rules of the destination country before booking.'
      }
    ],
    relatedPages: [
      { label: 'Send Package Internationally', description: 'Overview of Flyorago sender features.', to: '/send-package-internationally' },
      { label: 'Escrow Protection', description: 'See how funds are protected in Flyorago Vault.', to: '/escrow' },
      { label: 'Blog: India to Abroad Guide', description: 'Tips for India-to-USA/UK/Canada parcels.', to: '/blog/how-to-send-packages-from-india-to-usa-uk-canada' }
    ],
    serviceType: 'International Package Sender Guide'
  },
  {
    slug: 'traveler-guide',
    path: '/traveler-guide',
    category: 'guide',
    primaryKeyword: 'traveler luggage sharing guide',
    secondaryKeywords: [
      'how to carry packages while traveling safely',
      'airline baggage sharing guidelines',
      'traveler inspection checklist'
    ],
    seoTitle: 'Traveler Carrier Guide: Inspection, Aviation Rules & Payouts | Flyorago',
    metaDescription:
      'Step-by-step Flyorago Traveler Guide covering KYC onboarding, open-package inspection, IATA baggage compliance, customs awareness, and OTP escrow payouts.',
    badge: 'Official Traveler Handbook',
    h1: 'The Complete',
    h1Highlight: 'Traveler Carrier Guide',
    subtitle:
      'Everything verified travelers need to know to carry parcels responsibly, stay compliant with airline and customs regulations, and receive guaranteed escrow payouts.',
    audience: 'Travelers',
    primaryCta: { label: 'Register as a Traveler', to: '/signup' },
    secondaryCta: { label: 'See Escrow Payouts', to: '/escrow' },
    overviewTitle: 'Safety, Legal Awareness, and Seamless Handover',
    overviewParagraphs: [
      'As an international traveler, you are accountable for everything inside your carry-on and checked suitcases. Flyorago builds protective checkpoints into every stage so you never carry anything unverified.',
      'Always verify sender KYC status on the platform, inspect items unsealed in person, confirm airline weight and battery limits, and never mark handover complete without the recipient’s 6-digit OTP.'
    ],
    benefits: [
      {
        title: 'Pre-Flight Allowance Check',
        description: 'Confirm your exact airline baggage allowance so you avoid unexpected overweight fees.'
      },
      {
        title: 'Open-Box Inspection Rule',
        description: 'Inspect contents thoroughly—you have full authority to reject any non-compliant item.'
      },
      {
        title: 'Escrow Guarantee Before Travel',
        description: 'Only accept custody after seeing confirmed escrow funding inside Flyorago.'
      },
      {
        title: 'Proof via 6-Digit OTP',
        description: 'Entering the recipient’s OTP immediately records delivery completion and releases payout.'
      }
    ],
    stepsTitle: 'Traveler Best-Practice Sequence',
    steps: [
      {
        title: 'Publish Verified Flight Space',
        description: 'Share exact airport codes, departure dates, and spare kilograms.'
      },
      {
        title: 'Screen & Inspect at Handover',
        description: 'Verify item identity, check customs rules, and photograph contents.'
      },
      {
        title: 'Deliver & Enter OTP',
        description: 'Hand over at the destination and collect the 6-digit OTP for instant escrow release.'
      }
    ],
    trustPoints: [
      'Mandatory open-package inspection before acceptance',
      'Strict ban on sealed packages, liquids, and dangerous goods',
      'Escrow protection before departure'
    ],
    faqs: [
      {
        question: 'Can I carry electronics with batteries in checked luggage?',
        answer:
          'Spare lithium-ion batteries and power banks must always be carried in cabin baggage under IATA rules. Never place loose power banks in checked bags.'
      },
      {
        question: 'What if the recipient does not show up at the agreed time?',
        answer:
          'Keep all communication in Flyorago chat and contact 24/7 support immediately so our Trust & Safety team can coordinate without releasing or risking custody.'
      }
    ],
    relatedPages: [
      { label: 'Earn Money While Traveling', description: 'See how travelers monetize unused baggage.', to: '/travelers-earn-money' },
      { label: 'Safety Standards', description: 'Learn about Flyorago’s 4 safety pillars.', to: '/safety' },
      { label: 'Prohibited Items Guide', description: 'Items never allowed on Flyorago flights.', to: '/blog/prohibited-and-restricted-items-international-travel-delivery' }
    ],
    serviceType: 'Traveler Package Carrying Guide'
  },
  {
    slug: 'india-to-usa',
    path: '/india-to-usa',
    category: 'corridor',
    primaryKeyword: 'send packages from India to USA',
    secondaryKeywords: [
      'India to USA parcel delivery',
      'send parcel from India to USA with traveler',
      'India to US courier alternative'
    ],
    seoTitle: 'Send Packages from India to USA via Verified Travelers | Flyorago',
    metaDescription:
      'Send documents, gifts, and personal parcels from India (DEL, BOM, BLR, AMD) to the USA (JFK, EWR, SFO, ORD) via KYC-verified travelers with escrow protection.',
    badge: 'India ➔ USA Corridor',
    h1: 'Send Packages from',
    h1Highlight: 'India to the USA',
    subtitle:
      'Connect with KYC-verified travelers flying between major Indian airports and US gateways. Ideal for personal documents, eyeglasses, clothing, and permitted gifts.',
    audience: 'Senders & Travelers',
    primaryCta: { label: 'Find Travelers or Post Trip', to: '/signup' },
    secondaryCta: { label: 'Read India-to-Abroad Guide', to: '/blog/how-to-send-packages-from-india-to-usa-uk-canada' },
    overviewTitle: 'Connecting India and the United States Through Frequent Flyers',
    overviewParagraphs: [
      'Students, families, and professionals travel daily between India and major US cities. Flyorago helps senders connect with verified travelers who have spare checked luggage allowance on these routes—offering a practical alternative to expensive express couriers for small personal shipments.',
      'Matching depends on live verified traveler listings for your travel window. Every booking includes mandatory open-package inspection, escrow holding, and 6-digit OTP handover.'
    ],
    benefits: [
      {
        title: 'Major Indian & US Flight Hubs',
        description: 'High traveler activity across Delhi, Mumbai, Bengaluru, Ahmedabad, Hyderabad, New York, San Francisco, Chicago, and Dallas.'
      },
      {
        title: 'Avoid High Volumetric Minimums',
        description: 'Send compact 1–10 kg personal packages without commercial courier base surcharges.'
      },
      {
        title: 'Escrow & OTP Handover',
        description: 'Funds remain locked until the US recipient verifies delivery with a 6-digit OTP.'
      },
      {
        title: 'US Customs Awareness',
        description: 'Clear guidance on US CBP restrictions around food, agriculture, and prescription items.'
      }
    ],
    stepsTitle: 'How India-to-USA Delivery Works',
    steps: [
      {
        title: 'Create Account & Verify KYC',
        description: 'Complete identity verification as a sender or traveler on Flyorago.'
      },
      {
        title: 'Match on India–US Flight Dates',
        description: 'Browse verified travelers departing from DEL, BOM, AMD, BLR, or HYD to US airports.'
      },
      {
        title: 'Open Inspection & OTP Delivery',
        description: 'Inspect unsealed items at handover in India and confirm arrival in the US via 6-digit OTP.'
      }
    ],
    trustPoints: [
      'Mandatory KYC for both Indian senders and travelers',
      'Open-box physical inspection before departure',
      'Escrow-protected payment until US delivery OTP'
    ],
    corridor: {
      originHubs: ['Delhi (DEL)', 'Mumbai (BOM)', 'Ahmedabad (AMD)', 'Bengaluru (BLR)', 'Hyderabad (HYD)'],
      destinationHubs: ['New York (JFK / EWR)', 'San Francisco (SFO)', 'Chicago (ORD)', 'Dallas (DFW)', 'Washington (IAD)'],
      typicalItems: ['Academic & legal documents', 'Prescription eyeglasses & apparel', 'Books & personal electronics', 'Factory-sealed dry snacks (CBP compliant)'],
      customsNotes: [
        'US CBP prohibits fresh fruits, vegetables, meats, soil, and many dairy/homemade food items.',
        'Keep items unsealed for inspection at pickup and declare contents honestly.',
        'Check US CBP duty-free personal exemption rules before shipping high-value items.'
      ],
      disclaimer:
        'Delivery availability and transit timing depend on active verified travelers flying your selected dates and airline baggage limits. Flyorago is a peer-to-peer marketplace, not a licensed customs broker.'
    },
    faqs: [
      {
        question: 'Can I send homemade food or pickles from India to USA through a traveler?',
        answer:
          'US Customs and Border Protection (CBP) strictly restricts many homemade, dairy, meat, and agricultural items. Only send commercially sealed, CBP-permitted dry items that are accurately declared.'
      },
      {
        question: 'How long does an India to USA peer-to-peer delivery usually take?',
        answer:
          'Once matched with a traveler, transit aligns with their flight itinerary plus local handover timing—typically 2 to 6 days depending on pickup and arrival schedules.'
      }
    ],
    relatedPages: [
      { label: 'India to UK Guide', description: 'Send parcels between India and London/Manchester.', to: '/india-to-uk' },
      { label: 'India to Canada Guide', description: 'Corridor guide for Toronto and Vancouver.', to: '/india-to-canada' },
      { label: 'Sender Guide', description: 'Complete preparation checklist for senders.', to: '/sender-guide' }
    ],
    areaServed: ['India', 'United States'],
    serviceType: 'India to USA Peer-to-Peer Package Delivery'
  },
  {
    slug: 'india-to-uk',
    path: '/india-to-uk',
    category: 'corridor',
    primaryKeyword: 'India to UK parcel delivery',
    secondaryKeywords: [
      'send parcel from India to UK',
      'Ahmedabad to London package delivery',
      'India to London traveler delivery'
    ],
    seoTitle: 'India to UK Parcel Delivery via Verified Travelers | Flyorago',
    metaDescription:
      'Send documents, clothes, and personal parcels from India (AMD, BOM, DEL) to London and UK cities through KYC-verified travelers with Flyorago Escrow protection.',
    badge: 'India ➔ UK Corridor',
    h1: 'India to UK',
    h1Highlight: 'Parcel Delivery',
    subtitle:
      'Connect with verified flyers traveling between Indian hubs and London Heathrow, Gatwick, Manchester, or Birmingham—protected by KYC, inspection, and escrow.',
    audience: 'Senders & Travelers',
    primaryCta: { label: 'Get Started on Flyorago', to: '/signup' },
    secondaryCta: { label: 'How Flyorago Works', to: '/how-it-works' },
    overviewTitle: 'Fast, Community-Powered Shipping Between India and the UK',
    overviewParagraphs: [
      'Strong family, student, and business ties generate nonstop air travel between Ahmedabad, Mumbai, Delhi, and Bengaluru and UK airports such as London Heathrow and Manchester.',
      'Flyorago enables senders and travelers on these routes to share unused luggage space transparently, backed by identity verification, unsealed handover checks, and escrow OTP release.'
    ],
    benefits: [
      {
        title: 'Direct Nonstop Flight Corridors',
        description: 'Frequent flights between Indian metro hubs and London/Manchester keep transit times short.'
      },
      {
        title: 'Ideal for Students & Families',
        description: 'Send academic documents, winter wear, glasses, and personal essentials safely.'
      },
      {
        title: 'Verified Travelers Only',
        description: 'Government ID and selfie KYC are required before any traveler can accept parcels.'
      },
      {
        title: 'Escrow & 6-Digit OTP',
        description: 'Payment releases to the traveler only when the UK recipient confirms delivery.'
      }
    ],
    stepsTitle: 'Sending from India to the UK in 3 Steps',
    steps: [
      {
        title: 'Post Package or Search Trips',
        description: 'Specify your Indian pickup city, UK destination, and item weight.'
      },
      {
        title: 'Confirm Match & Fund Escrow',
        description: 'Lock payment in Flyorago Escrow before handover.'
      },
      {
        title: 'Inspect & Verify Delivery via OTP',
        description: 'Traveler inspects contents unsealed at pickup and completes handover in the UK with OTP.'
      }
    ],
    trustPoints: [
      'Mandatory unsealed inspection before baggage packing',
      'UK Border Force compliance for personal goods',
      'Escrow protection from pickup to OTP confirmation'
    ],
    corridor: {
      originHubs: ['Ahmedabad (AMD)', 'Mumbai (BOM)', 'Delhi (DEL)', 'Bengaluru (BLR)', 'Amritsar (ATQ)'],
      destinationHubs: ['London Heathrow (LHR)', 'London Gatwick (LGW)', 'Manchester (MAN)', 'Birmingham (BHX)'],
      typicalItems: ['University & visa paperwork', 'Ethnic wear & winter clothing', 'Books & small personal gifts', 'Eyeglasses & permitted dry goods'],
      customsNotes: [
        'UK Border Force strictly prohibits meat, dairy products, and certain plant materials from non-EU countries.',
        'Ensure items fall within UK personal gift/allowance rules or declare appropriately.',
        'Never send unverified sealed boxes or restricted electronics.'
      ],
      disclaimer:
        'Route matching depends on live verified traveler availability and airline baggage allowances. Users are responsible for complying with Indian and UK customs laws.'
    },
    faqs: [
      {
        question: 'Can travelers carry clothes and books from Ahmedabad or Mumbai to London?',
        answer:
          'Yes, personal clothing, books, and documents are permitted on Flyorago provided the traveler inspects the items unsealed and the shipment fits within airline baggage limits.'
      },
      {
        question: 'How is my payment protected on India to UK routes?',
        answer:
          'Sender funds remain safely in Flyorago Escrow until the recipient in the UK enters or provides the 6-digit OTP upon delivery.'
      }
    ],
    relatedPages: [
      { label: 'India to USA Guide', description: 'Corridor guide for Indian and US airport hubs.', to: '/india-to-usa' },
      { label: 'India to Canada Guide', description: 'Send personal packages to Toronto and Vancouver.', to: '/india-to-canada' },
      { label: 'Safety & Security', description: 'Review KYC, inspection, and escrow safeguards.', to: '/safety' }
    ],
    areaServed: ['India', 'United Kingdom'],
    serviceType: 'India to UK Peer-to-Peer Package Delivery'
  },
  {
    slug: 'india-to-canada',
    path: '/india-to-canada',
    category: 'corridor',
    primaryKeyword: 'India to Canada parcel delivery',
    secondaryKeywords: [
      'send parcel from India to Canada',
      'Delhi to Toronto package delivery',
      'send documents India to Canada'
    ],
    seoTitle: 'India to Canada Parcel Delivery via Verified Travelers | Flyorago',
    metaDescription:
      'Send documents, clothes, and personal parcels from India to Toronto, Vancouver, and Montreal with KYC-verified travelers and escrow protection.',
    badge: 'India ➔ Canada Corridor',
    h1: 'India to Canada',
    h1Highlight: 'Parcel Delivery',
    subtitle:
      'Match with identity-verified flyers traveling from Delhi, Mumbai, Ahmedabad, or Amritsar to Toronto, Vancouver, and Montreal—protected by Flyorago Escrow.',
    audience: 'Senders & Travelers',
    primaryCta: { label: 'Join Flyorago Free', to: '/signup' },
    secondaryCta: { label: 'Read Sender Guide', to: '/sender-guide' },
    overviewTitle: 'Connecting Indian Families and Students Across Canada',
    overviewParagraphs: [
      'Canada hosts one of the largest Indian student and diaspora communities, creating steady year-round flight traffic between Delhi, Mumbai, Chandigarh/Amritsar, Ahmedabad, and Toronto or Vancouver.',
      'Flyorago helps senders avoid steep express courier charges on small personal items while allowing verified travelers to earn from unused checked baggage capacity.'
    ],
    benefits: [
      {
        title: 'Popular Student & Family Corridors',
        description: 'Connect across Delhi–Toronto, Mumbai–Vancouver, and Ahmedabad–Montreal routes.'
      },
      {
        title: 'Escrow & OTP Security',
        description: 'Payments never release until the Canadian recipient confirms delivery with OTP.'
      },
      {
        title: 'Open-Package Verification',
        description: 'Travelers inspect every item in person before carrying it on board.'
      },
      {
        title: 'CBSA Compliance Awareness',
        description: 'Clear reminders regarding Canadian customs and food/plant declarations.'
      }
    ],
    stepsTitle: 'How India-to-Canada Matching Works',
    steps: [
      {
        title: 'Verify Your Profile',
        description: 'Complete KYC verification to unlock posting and matching.'
      },
      {
        title: 'Match Flight & Weight',
        description: 'Select a verified traveler flying to YYZ, YVR, or YUL with spare luggage room.'
      },
      {
        title: 'Handover & Confirm OTP',
        description: 'Complete unsealed inspection in India and verify delivery in Canada with the 6-digit OTP.'
      }
    ],
    trustPoints: [
      'KYC verified senders and travelers',
      'Zero sealed-box acceptance policy',
      'Escrow-locked payment protection'
    ],
    corridor: {
      originHubs: ['Delhi (DEL)', 'Mumbai (BOM)', 'Ahmedabad (AMD)', 'Amritsar (ATQ)', 'Bengaluru (BLR)'],
      destinationHubs: ['Toronto (YYZ)', 'Vancouver (YVR)', 'Montreal (YUL)', 'Calgary (YYC)'],
      typicalItems: ['Academic records & official paperwork', 'Winter apparel & personal belongings', 'Eyeglasses & books', 'Permitted non-perishable gifts'],
      customsNotes: [
        'Canada Border Services Agency (CBSA) strictly regulates food, plants, animal products, and prescription medications.',
        'Personal gifts above Canadian exemption limits may be subject to duties/taxes.',
        'All items must be inspected unsealed before departure.'
      ],
      disclaimer:
        'Traveler availability varies by date and airline allowance. Both parties must follow Indian export and CBSA import regulations.'
    },
    faqs: [
      {
        question: 'Can I send winter jackets or documents from Delhi to Toronto?',
        answer:
          'Yes, clothing and documents are commonly carried within a traveler’s spare baggage allowance after unsealed inspection and escrow confirmation.'
      },
      {
        question: 'Are prohibited items blocked on India to Canada bookings?',
        answer:
          'Yes. Dangerous goods, liquids, narcotics, and restricted agricultural products are strictly prohibited on Flyorago.'
      }
    ],
    relatedPages: [
      { label: 'India to USA Guide', description: 'Send parcels between India and major US hubs.', to: '/india-to-usa' },
      { label: 'India to Australia Guide', description: 'Strict biosecurity and travel tips for Australia.', to: '/india-to-australia' },
      { label: 'Travelers Earn Money', description: 'Turn spare Canada flight baggage into earnings.', to: '/travelers-earn-money' }
    ],
    areaServed: ['India', 'Canada'],
    serviceType: 'India to Canada Peer-to-Peer Package Delivery'
  },
  {
    slug: 'india-to-australia',
    path: '/india-to-australia',
    category: 'corridor',
    primaryKeyword: 'India to Australia parcel delivery',
    secondaryKeywords: [
      'send parcel from India to Australia',
      'India to Sydney Melbourne package delivery',
      'send documents India to Australia'
    ],
    seoTitle: 'India to Australia Parcel Delivery via Verified Travelers | Flyorago',
    metaDescription:
      'Send documents, books, and compliant personal parcels from India to Sydney and Melbourne via KYC-verified travelers with strict biosecurity awareness and escrow.',
    badge: 'India ➔ Australia Corridor',
    h1: 'India to Australia',
    h1Highlight: 'Parcel Delivery',
    subtitle:
      'Connect with verified flyers traveling from India to Sydney, Melbourne, Brisbane, or Perth—built around strict biosecurity compliance, KYC checks, and escrow protection.',
    audience: 'Senders & Travelers',
    primaryCta: { label: 'Sign Up to Match Routes', to: '/signup' },
    secondaryCta: { label: 'Check Prohibited Items', to: '/blog/prohibited-and-restricted-items-international-travel-delivery' },
    overviewTitle: 'Responsible Peer-to-Peer Delivery on India–Australia Flights',
    overviewParagraphs: [
      'Australia enforces some of the world’s strictest biosecurity and border inspection rules. While documents, clothing, books, and sealed personal electronics are straightforward when inspected, food, spices, wooden items, and plant materials require extreme caution.',
      'Flyorago requires unsealed physical inspection before pickup so travelers know exactly what they are carrying into Australian customs—keeping every journey transparent and escrow-protected.'
    ],
    benefits: [
      {
        title: 'Biosecurity-First Guidelines',
        description: 'Clear warnings help senders avoid prohibited spices, seeds, dairy, and organic items.'
      },
      {
        title: 'Direct Long-Haul Flight Speed',
        description: 'Move urgent documents or clothing without paying steep air-freight minimums.'
      },
      {
        title: 'KYC & Open Inspection',
        description: 'Verified travelers inspect every item in person prior to departure.'
      },
      {
        title: 'Escrow OTP Release',
        description: 'Funds release only when the recipient confirms delivery in Australia.'
      }
    ],
    stepsTitle: 'Sending Safely from India to Australia',
    steps: [
      {
        title: 'Check Australian Border Eligibility',
        description: 'Confirm your parcel contains non-biological, ABF-compliant items such as papers, apparel, or books.'
      },
      {
        title: 'Match With a Verified Flyer',
        description: 'Connect with a traveler heading to SYD, MEL, BNE, or PER.'
      },
      {
        title: 'Inspect, Fly & Verify OTP',
        description: 'Complete unsealed inspection in India and confirm delivery via OTP in Australia.'
      }
    ],
    trustPoints: [
      'Strict warning against undeclared food, spices, or wood entering Australia',
      'Mandatory KYC & open-package inspection',
      'Escrow-protected booking until OTP confirmation'
    ],
    corridor: {
      originHubs: ['Delhi (DEL)', 'Mumbai (BOM)', 'Bengaluru (BLR)', 'Chennai (MAA)', 'Hyderabad (HYD)'],
      destinationHubs: ['Sydney (SYD)', 'Melbourne (MEL)', 'Brisbane (BNE)', 'Perth (PER)'],
      typicalItems: ['Official & academic documents', 'Clothing, spectacles & books', 'Non-restricted personal electronics (cabin rules for batteries)'],
      customsNotes: [
        'Australian Border Force (ABF) enforces severe penalties for undeclared food, spices, seeds, herbs, dairy, or wooden products.',
        'We strongly advise against sending any homemade food or biological materials to Australia.',
        'All items must be unsealed for traveler inspection.'
      ],
      disclaimer:
        'Traveler matching depends on active verified trips. Travelers must declare any dutiable or inspectable goods at Australian Border Force checkpoints.'
    },
    faqs: [
      {
        question: 'Can I send homemade snacks or spices from India to Australia on Flyorago?',
        answer:
          'We strongly advise against sending homemade food, spices, seeds, or herbal items to Australia due to strict Australian biosecurity laws and potential border penalties.'
      },
      {
        question: 'What items are safest for India to Australia traveler delivery?',
        answer:
          'Documents, books, prescription eyeglasses, and clean clothing are the most straightforward permitted items when inspected unsealed.'
      }
    ],
    relatedPages: [
      { label: 'India to UAE Guide', description: 'Fast corridor between India and Dubai/Abu Dhabi.', to: '/india-to-uae' },
      { label: 'Prohibited Items Guide', description: 'Review banned and restricted items before booking.', to: '/blog/prohibited-and-restricted-items-international-travel-delivery' },
      { label: 'Safety Standards', description: 'Learn how Flyorago screens users and shipments.', to: '/safety' }
    ],
    areaServed: ['India', 'Australia'],
    serviceType: 'India to Australia Peer-to-Peer Package Delivery'
  },
  {
    slug: 'india-to-uae',
    path: '/india-to-uae',
    category: 'corridor',
    primaryKeyword: 'India to UAE parcel delivery',
    secondaryKeywords: [
      'send parcel from India to Dubai',
      'Mumbai to Dubai package delivery',
      'India to UAE traveler delivery'
    ],
    seoTitle: 'India to UAE & Dubai Parcel Delivery via Verified Travelers | Flyorago',
    metaDescription:
      'Send documents, apparel, and personal packages from India (BOM, DEL, AMD, COK) to Dubai and Abu Dhabi with KYC-verified travelers and Flyorago Escrow.',
    badge: 'India ➔ UAE Corridor',
    h1: 'India to UAE',
    h1Highlight: 'Parcel Delivery',
    subtitle:
      'One of the world’s busiest air corridors—connect with verified flyers between Mumbai, Delhi, Ahmedabad, Kochi, and Dubai or Abu Dhabi in just a few clicks.',
    audience: 'Senders & Travelers',
    primaryCta: { label: 'Find a Traveler or Post Trip', to: '/signup' },
    secondaryCta: { label: 'Explore Services', to: '/services' },
    overviewTitle: 'High-Frequency Flights Between India and the UAE',
    overviewParagraphs: [
      'With dozens of daily flights connecting Mumbai, Delhi, Ahmedabad, Hyderabad, Bengaluru, and Kochi to Dubai (DXB) and Abu Dhabi (AUH), the India–UAE route is ideally suited for fast peer-to-peer document and parcel delivery.',
      'Senders save on urgent courier fees while travelers offset regional travel costs—all protected by mandatory KYC, unsealed inspection, escrow holding, and 6-digit OTP confirmation.'
    ],
    benefits: [
      {
        title: '1–3 Day Typical Flight Window',
        description: 'Short 3-to-4-hour flight durations make same-week handover practical when matched.'
      },
      {
        title: 'Extensive Indian Airport Coverage',
        description: 'Frequent flyers from Mumbai, Delhi, Ahmedabad, Kochi, and Hyderabad.'
      },
      {
        title: 'Escrow & OTP Safeguards',
        description: 'Sender payment releases only after the UAE recipient provides the handover OTP.'
      },
      {
        title: 'UAE Customs Awareness',
        description: 'Clear reminders regarding restricted medications and prohibited items under UAE law.'
      }
    ],
    stepsTitle: 'How India-to-UAE Delivery Works',
    steps: [
      {
        title: 'Verify & List Your Need',
        description: 'Complete KYC and share your pickup city, UAE destination, and weight.'
      },
      {
        title: 'Match & Secure Escrow',
        description: 'Confirm a verified flyer and lock funds in Flyorago Escrow.'
      },
      {
        title: 'Inspect & Confirm With OTP',
        description: 'Complete open inspection in India and verify handover in Dubai/Abu Dhabi via OTP.'
      }
    ],
    trustPoints: [
      'Strict compliance with UAE customs and controlled-substance laws',
      'Mandatory open-package inspection before acceptance',
      'Escrow held until OTP handover'
    ],
    corridor: {
      originHubs: ['Mumbai (BOM)', 'Delhi (DEL)', 'Ahmedabad (AMD)', 'Kochi (COK)', 'Hyderabad (HYD)'],
      destinationHubs: ['Dubai (DXB)', 'Abu Dhabi (AUH)', 'Sharjah (SHJ)'],
      typicalItems: ['Business & personal paperwork', 'Apparel, footwear & eyeglasses', 'Books & approved personal gifts'],
      customsNotes: [
        'UAE enforces strict rules on controlled medications, certain painkillers/psychotropics, e-cigarettes, and prohibited media.',
        'Never send medicines without checking UAE Ministry of Health (MOHAP) rules and prescriptions.',
        'All items must be unsealed for traveler inspection.'
      ],
      disclaimer:
        'Actual match availability depends on active verified travelers on your dates. Users must obey Indian and UAE customs regulations.'
    },
    faqs: [
      {
        question: 'Can I send prescription medicines from India to Dubai via a traveler?',
        answer:
          'UAE has very strict rules on controlled and prescription medications. Travelers should not carry pharmaceuticals for others unless fully verified under official UAE MOHAP regulations—check official guidance first.'
      },
      {
        question: 'How fast can a document reach Dubai from Mumbai or Ahmedabad?',
        answer:
          'When an active verified traveler matches your date, flights take around 3–4 hours, allowing 1–3 day total turnaround depending on handover timing.'
      }
    ],
    relatedPages: [
      { label: 'India to USA Guide', description: 'Send parcels between India and major US hubs.', to: '/india-to-usa' },
      { label: 'India to UK Guide', description: 'Corridor guide for London and Manchester.', to: '/india-to-uk' },
      { label: 'Escrow Protection', description: 'How Flyorago protects every booking.', to: '/escrow' }
    ],
    areaServed: ['India', 'United Arab Emirates'],
    serviceType: 'India to UAE Peer-to-Peer Package Delivery'
  }
];

export function getLandingPageBySlug(slug: string): SeoLandingPageConfig | undefined {
  return SEO_LANDING_PAGES.find((p) => p.slug === slug);
}
