from django.urls import path
from .views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('read', NotificationMarkReadView.as_view(), name='notification_read_all'),
    path('read/<int:pk>', NotificationMarkReadView.as_view(), name='notification_read_single'),
]
