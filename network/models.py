from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.TextField(default="")
    followers = models.TextField(default="")
    posts = models.IntegerField(default=0)
    bio = models.TextField(default="No biography provided.", max_length=300)


class Post(models.Model):
    author = models.TextField()
    content = models.TextField(max_length=500)
    likes = models.TextField(default=" ")
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id":self.id,
            "author":self.author,
            "content":self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes":self.likes
        }


