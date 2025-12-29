from django.urls import path
from .views import CategoryViewSet, NoteViewSet, NoteItemViewSet, SyncView

urlpatterns = [
    # Category
    path('categories', CategoryViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('categories/<uuid:pk>', CategoryViewSet.as_view({'put': 'update', 'delete': 'destroy'})),

    # Note
    path('categories/<uuid:category_pk>/notes', NoteViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('notes/<uuid:pk>', NoteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

    # NoteItem
    path('notes/<uuid:note_pk>/items', NoteItemViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('items/<uuid:pk>', NoteItemViewSet.as_view({'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})),

    # Sync
    path('sync', SyncView.as_view(), name='sync'),
]
