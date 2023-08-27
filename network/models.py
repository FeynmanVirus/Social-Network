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
