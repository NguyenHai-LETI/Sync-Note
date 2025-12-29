import uuid
from django.db import models
from django.conf import settings

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

class Category(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order_index = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name

class Note(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class NoteItem(BaseModel):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    order_index = models.IntegerField(default=0)

    def __str__(self):
        return self.title
