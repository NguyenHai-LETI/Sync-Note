from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Category, Note, NoteItem
from .serializers import CategorySerializer, NoteSerializer, NoteItemSerializer

class BaseSoftDeleteViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

class CategoryViewSet(BaseSoftDeleteViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, is_deleted=False).order_by('order_index', 'created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NoteViewSet(BaseSoftDeleteViewSet):
    serializer_class = NoteSerializer

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user, is_deleted=False)
        category_id = self.kwargs.get('category_pk')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs.order_by('created_at')

    def perform_create(self, serializer):
        category_id = self.kwargs.get('category_pk')
        if category_id:
            category = get_object_or_404(Category, id=category_id, user=self.request.user, is_deleted=False)
            serializer.save(user=self.request.user, category=category)
        else:
             # Should not happen if URL routing is correct (i.e. only create via nested)
             # But if they POST to /notes/, we would need category in user input.
             # For now, assume nested route.
             serializer.save(user=self.request.user)

class NoteItemViewSet(BaseSoftDeleteViewSet):
    serializer_class = NoteItemSerializer

    def get_queryset(self):
        qs = NoteItem.objects.filter(note__user=self.request.user, is_deleted=False)
        note_id = self.kwargs.get('note_pk')
        if note_id:
             qs = qs.filter(note_id=note_id)
        return qs.order_by('order_index', 'created_at')

    def perform_create(self, serializer):
        note_id = self.kwargs.get('note_pk')
        if note_id:
            note = get_object_or_404(Note, id=note_id, user=self.request.user, is_deleted=False)
            serializer.save(note=note)

class SyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        updated_after = request.query_params.get('updated_after')
        
        categories_qs = Category.objects.filter(user=request.user)
        notes_qs = Note.objects.filter(user=request.user)
        items_qs = NoteItem.objects.filter(note__user=request.user)

        if updated_after:
            from django.utils.dateparse import parse_datetime
            date = parse_datetime(updated_after)
            if date:
                categories_qs = categories_qs.filter(updated_at__gt=date)
                notes_qs = notes_qs.filter(updated_at__gt=date)
                items_qs = items_qs.filter(updated_at__gt=date)
        
        return Response({
            'categories_changed': CategorySerializer(categories_qs, many=True).data,
            'notes_changed': NoteSerializer(notes_qs, many=True).data,
            'note_items_changed': NoteItemSerializer(items_qs, many=True).data,
        })
