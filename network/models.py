from django.contrib.auth.models import AbstractUser
from django.db import models
from project4 import settings
from datetime import datetime  

today = datetime.now()
today_string = today.strftime("%Y-%m-%d %H:%M:%S")

class User(AbstractUser):
    pass

class Posts(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, related_name="post_owner")
    text_content = models.CharField(max_length=1000, default='')
    likes = models.IntegerField(default=0)
    date_of_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} posted '{self.text_content}' on {self.date_of_creation}, likes: {self.likes}"

class UserFollowData(models.Model):
    follower_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="following")
    following_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="follower")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower_user','following_user'],  name="unique_followers")
        ]

    def __str__(self):
        return f"{self.follower_user} follows {self.following_user}"

    def serialize(self):
        return {
            "id": self.id,
            "follows": self.following_user.username,
            "follower": self.follower_user.username,
        }

class UserLikes(models.Model):
    like_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="liked_posts")
    like_post = models.ForeignKey("Posts", on_delete=models.CASCADE, related_name="liked_users")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['like_user', 'like_post'], name="unique_likes")
        ]

    def __str__(self):
        return f"{self.like_user} likes {self.like_post}"

class Comments(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comment_user")
    post = models.ForeignKey("Posts", on_delete=models.CASCADE, related_name="comments")
    comment_text = models.CharField(max_length=1000, default='')
    time_of_comment = models.DateTimeField(auto_now_add=True)
    comment_likes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user} commented {self.comment_text} on {self.post} at {self.time_of_comment}"

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post.id,
            "comment": self.comment_text,
            "likes": self.comment_likes,
            "time": self.time_of_comment
        } 

class CommentLikes(models.Model):
    comment_like_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comment_like_user")
    comment_liked = models.ForeignKey("Comments", on_delete=models.CASCADE, related_name="comment_liked")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['comment_like_user', 'comment_liked'], name="unique_comment_likes")
        ]
    
    def __str__(self):
        return f"{self.comment_like_user} liked comment: {self.comment_liked}"