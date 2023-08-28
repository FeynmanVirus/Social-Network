from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from .forms import *
from .models import *
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F
import json
import random
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

def index(request):
    # get page no.
    page = request.GET.get('page', 1)

    # get all posts
    all_posts = Posts.objects.all().order_by('-date_of_creation')
    
    #paginate
    paginate = Paginator(all_posts, 10)

    try:
        posts = paginate.page(page)
    except PageNotAnInteger:
        posts = paginate.page(1)
    except EmptyPage:
        posts = paginate.page(paginate.num_pages)
    
    # if logged in 
    if request.user.is_authenticated:
        new_post_form = NewPostForm()

        #liked posts
        user_get = User.objects.get(pk=request.user.id)
        liked_posts = [post['like_post_id'] for post in user_get.liked_posts.all().values('like_post_id')]
        

        return render(request, "network/index.html", {
            "form_post": new_post_form, 
            "posts": posts,
            "liked_posts": liked_posts
        })
    #if not logged in
    return render(request, "network/index.html", {
        "posts": posts
    })


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
def new_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        create_post = Posts(user=request.user, text_content=data['text_content'])
        create_post.save()

        return JsonResponse({"user": request.user.username, "content": create_post.text_content, "date": create_post.date_of_creation, "id": create_post.id}, status=200)

@csrf_exempt
def show_profile(request, name):
    if request.method == 'GET':
        pass

    user_get = User.objects.get(username=name)
    posts = Posts.objects.filter(user=user_get).order_by('-date_of_creation') 

    try:
        user_get.follower.get(follower_user=request.user)
        following_status = "Following"
    except:
        following_status = "Follow"

 
    followers = user_get.follower.all().count()
    following = user_get.following.all().count()
    user_owner = False
    if user_get == request.user:
        user_owner = True 

    return render(request, "network/profile.html", {
        "user_get": user_get,
        "posts": posts,
        "user_owner": user_owner,
        "follow_status": following_status,
        "followers": followers,
        "following": following,
    })

@csrf_exempt
def follow_user(request, user):
    if request.method == 'POST':

        data = json.loads(request.body)

        follow_user = User.objects.get(username=user)

        if data['current_status'] == 'Follow':
            follow = UserFollowData(follower_user=request.user, following_user=follow_user)
            follow.save()
        else:
            unfollow = UserFollowData.objects.get(follower_user=request.user, following_user=follow_user).delete()


        return JsonResponse({"successful": "true"}, status=200)
    else:
        return render(request, "error.html")

def following(request):
    if request.method == 'POST':
        return render(request, "error.html")
    if not request.user.is_authenticated:
        return HttpResponse("404 Forbidden")
    
    following = request.user.following.all().values('following_user')
    posts = Posts.objects.filter(user__in=following).order_by('?')
    return render(request, 'network/following.html', {
        "posts": posts,
    })

@csrf_exempt
def edit_post(request, postid):
    if request.method != 'POST':
        return render(request, "network/error.html")
    data = json.loads(request.body)
    print(data)
    update_post = Posts.objects.filter(pk=postid, user=request.user).update(text_content=data['edit_content'])
    post_likes = Posts.objects.filter(pk=postid).values('likes')
    print(update_post)
    return JsonResponse({'user': request.user.username, "likes": post_likes[0]['likes']}, status=200)

@csrf_exempt
def like_post(request, postid):
    if request.method != 'POST':
        return render(request, "network/error.html") 
    data = json.loads(request.body)

    post = Posts.objects.get(pk=postid)
    if data['likeStatus'] == 'liked':
        like = UserLikes(like_user=request.user, like_post=post)
        post.likes += 1
        post.save()
        like.save()
    else:
        UserLikes.objects.get(like_user=request.user, like_post=post).delete()
        post.likes -= 1
        post.save()
    return JsonResponse({"user": request.user.username, "likes": post.likes}, status=200)

@csrf_exempt
def comment(request, postid):
    if request.method == 'POST':
        data = json.loads(request.body)
        post = Posts.objects.get(pk=postid)
        comment = Comments(user=request.user, post=post, comment_text=data['comment_text'])
        comment.save()
        return JsonResponse({"id": comment.id, "user": request.user.username, "time": comment.time_of_comment}, status=200)
    #GET
    post = Posts.objects.get(pk=postid)
    comments = Comments.objects.filter(post=post).order_by('-time_of_comment')
    print(comments) 
    #get liked comments
    try:
        user_get = User.objects.get(pk=request.user.id)
        liked_comments = [comment['comment_liked_id'] for comment in user_get.comment_like_user.all().values('comment_liked_id')]
    except:
        liked_comments =  None
    return JsonResponse([[comment.serialize() for comment in comments], liked_comments], safe=False)

@csrf_exempt
def like_comment(request, postid):
    if request.method != 'POST':
        return render(request, "network.error.html")
    data = json.loads(request.body)

    comment = Comments.objects.get(pk=data['commentID'])
    if data['likeStatus'] == 'liked':
        comment_like = CommentLikes(comment_like_user=request.user, comment_liked=comment)
        comment.comment_likes += 1
        comment_like.save()
        comment.save()
    else:
        CommentLikes.objects.get(comment_like_user=request.user, comment_liked=comment).delete()
        comment.comment_likes -= 1
        comment.save()
    return JsonResponse({"likes": comment.comment_likes}, status=200)
