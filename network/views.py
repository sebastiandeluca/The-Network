import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import PageNotAnInteger, Paginator, InvalidPage, EmptyPage


from .models import User, Post


POSTS_PER = 10

def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
def createpost(request):
    if request.method != "POST":
        # I know I don't need this, but I'm writing it anyways in case I make mistakes.
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    post_author = data.get("author")
    if post_author == "":
        return JsonResponse({
            "error": "Please be signed in to make a post."},
            status=400)
    
    post_content = data.get("content")
    if post_content == "":
        return JsonResponse({
            "Error":"You cannot make an empty post."},
            status=401)
    new_post = Post(
        author=post_author,
        content=post_content,
        likes=0
    )
    poster = User.objects.get(username=post_author)
    newposts = int(poster.posts) + 1
    poster.posts = newposts
    poster.save()
    new_post.save()
    return JsonResponse({"message":"Post created successfully."})


def get_all(request):
    posts = Post.objects.all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


def update_home(request,page_num):
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    pagin = Paginator(posts, POSTS_PER)
    page = request.GET.get('page', page_num)
    try:
        return JsonResponse([post.serialize() for post in pagin.page(page)], safe=False)
    except PageNotAnInteger:
        page = 1
        return JsonResponse([post.serialize() for post in pagin.page(page)], safe=False)


def get_posts(request,username):
    posts = Post.objects.filter(author=username)
    posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


def get_followed_posts(request, username, page_num):
    user = User.objects.get(username=request.user)
    usersfollowed = user.following.split(",")
    followed_posts = []
    for x in usersfollowed:
        for posts in Post.objects.filter(author=x):
            followed_posts.append(posts)
    pagin = Paginator(followed_posts, POSTS_PER)
    page = request.GET.get('page', page_num)
    try:
        return JsonResponse([post.serialize() for post in pagin.page(page)], safe=False)
    except (PageNotAnInteger, EmptyPage):
        page = 1
        return JsonResponse([post.serialize() for post in pagin.page(page)], safe=False)


def get_profile(request,username):
    user = User.objects.filter(username=username).values()
    userdict = {"user":list(user)}
    return JsonResponse(userdict["user"], safe=False)


def like_post(request,postid):
    post = Post.objects.get(id=postid)
    liker = str(request.user) + ","
    post.likes+= liker
    post.save()
    return JsonResponse(post.serialize(), safe=False)


def unlike_post(request,postid):
    post = Post.objects.get(id=postid)
    liker = str(request.user) + ","
    postlikes = post.likes.replace(liker, "")

    post.likes = postlikes
    post.save()
    return JsonResponse(post.serialize(), safe=False)


def update_user_follower(request, user, followed):
    user = User.objects.get(username=user)
    follows = user.following.split(",")
    if followed in follows:
        follows.remove(followed)
        try:
            follows.remove("")
        except:
            pass
    else:
        follows.append(followed)
    follows_str = ""
    for x in follows:
        if x == "":
            pass
        else:
            follows_str += x + ","
    user.following = follows_str
    user.save()


def follow_user(request, username):
    user = User.objects.get(username=username)
    follow = str(request.user) + ","
    user.followers += follow
    user.followers.replace("AnonymousUser,", "")
    user.save()
    update_user_follower(request,request.user, username)
    return JsonResponse({"message":"User followed"})


def update_follow(request, username):
    user = User.objects.get(username=username)
    followers = user.followers.split(",")
    try:
        followers.remove("AnonymousUser")
    except:
        pass
    return JsonResponse(len(followers) - 1, safe=False)


def unfollow_user(request,username):
    user = User.objects.get(username=username)
    followers = (user.followers)
    follow = str(request.user) + ","
    user.followers = followers.replace(follow, "")
    update_user_follower(request,request.user, username)
    user.save()
    return JsonResponse({"message":"User followed"})


def edit_post(request, post_id):
    post = Post.objects.get(id=post_id)
    if request.method == "GET":
        return JsonResponse([post.serialize()],safe=False)
    else:
        data = json.loads((request.body))
        content = data.get("content")
        post.content = content
        post.save()
        return JsonResponse([post.serialize()],safe=False)
