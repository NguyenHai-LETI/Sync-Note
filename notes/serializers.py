from rest_framework import serializers
from .models import Category, Note, NoteItem

class CategorySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=False)
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'order_index', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['created_at', 'updated_at', 'is_deleted']

class NoteItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=False)
    class Meta:
        model = NoteItem
        fields = ['id', 'note', 'title', 'content', 'is_completed', 'order_index', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['created_at', 'updated_at', 'is_deleted', 'note']

class NoteSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=False)
    # We might want to include items count or something, but basic is fine.
    class Meta:
        model = Note
        fields = ['id', 'category', 'title', 'description', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['created_at', 'updated_at', 'is_deleted', 'category']
