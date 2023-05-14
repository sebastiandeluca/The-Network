
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("posts/create", views.createpost, name="createPost"),
    path("posts<int:page_num>", views.update_home, name="update"),
    path("posts/all", views.get_all, name="allposts"),
    path("posts/<str:username>", views.get_posts, name="getPosts"),
    path("posts/<str:post_id>/edit", views.edit_post, name="editPost"),
    path('profile/<str:username>', views.get_profile, name="profile"),
    path("posts/like/<str:postid>", views.like_post, name="listPost"),
    path("posts/unlike/<str:postid>", views.unlike_post, name="unlistPost"),
    path("user/follow_<str:username>", views.follow_user, name="followUser"),
    path("user/unfollow_<str:username>", views.unfollow_user, name="unfollowUser"),
    path("user/<str:username>/updatefollowcount", views.update_follow, name="updateF"),
    path("posts/<str:username>/following/<int:page_num>", views.get_followed_posts, name="followed")
]
