
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newpost", views.new_post, name="newpost"),
    path("profile/<str:name>", views.show_profile, name="profile"),
    path("follow/<str:user>", views.follow_user, name="follow"),
    path("following", views.following, name="following"),
    path("editpost/<int:postid>", views.edit_post, name="editpost"),
]
