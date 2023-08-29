document.addEventListener('DOMContentLoaded', function() {
    try{
    document.querySelector('#follow-btn').addEventListener('click', followUser);     
    } catch (TypeError) {

    }
    const followingBtn = document.querySelector('#following')
    const followerBtn = document.querySelector('#followers')
    followerBtn.textContent = `${parseInt(followers)} Followers`
    followingBtn.textContent = `${parseInt(following)} Following`
    try {
        const dialog = document.querySelector('.modal')
        document.querySelector('#following-link').addEventListener('click', function() {
            dialog.showModal()
            showFollowing()
        })
        document.querySelector('#follower-link').addEventListener('click', function() {
            dialog.showModal()
            showFollowers()
        })
    } catch(error) {
    }
})

function showFollowing() {
    document.querySelector('.follows').innerHTML = ''
    fetch('/showfollowing')
    .then(response => response.json())
    .then(result => {
        console.log(result)
        const followDiv = document.querySelector('.follows') 
        if (result.length == 0) {
            followDiv.innerHTML = '<h5>You havent followed any users yet'
            return;
        }
        for (let i = 0; i < result.length; i++) {
            const div = document.createElement('div')
            const HTMLContent = `<span class="username-details">${result[i]['follows']}</span>
                                <button type="submit" data-followinguser="${result[i]['follows']}" class="button-30 following-btn">Following</button>
                                <hr>` 
            div.innerHTML = HTMLContent
            followDiv.append(div)
            document.querySelector('.following-btn').addEventListener('click', function(event) {
                unfollow(event)
            })
        } 
    })
}

function showFollowers(event) {
    document.querySelector('.follows').innerHTML = ''
    fetch('/showfollowers')
    .then(response => response.json())
    .then(result => {
        console.log(result)
        const followDiv = document.querySelector('.follows') 
        if (result.length == 0) {
            followDiv.innerHTML = '<h5>You dont have any followers yet'
            return;
        }
        for (let i = 0; i < result.length; i++) {
            const div = document.createElement('div')
            const HTMLContent = `<span class="username-details">${result[i]['follower']}</span>
                                <a href="/profile/${result[i]['follower']}"><button type="submit" data-followeruser="${result[i]['follower']}" class="button-30 following-btn">Visit</button></a>
                                <hr>` 
            div.innerHTML = HTMLContent
            followDiv.append(div)
        } 
    })
}

function unfollow(event) {
    const userToUnfollow = event.target.dataset.followinguser
    fetch(`/follow/${userToUnfollow}`, {
        method: 'POST',
        body: JSON.stringify({
            current_status: 'Unfollow'
        })
    })    
    .then(response => response.json())
    .then(result => {
        event.target.parentElement.remove()
    })
}

function followUser(event) {
    event.preventDefault();
    const followStatus = event.target.value
    console.log(event.target.value)
    const userToFollow = document.querySelector('#profile-username').textContent;
    console.log(userToFollow);
    fetch(`/follow/${userToFollow}`, {
        method: 'POST',
        body: JSON.stringify({
            current_status: followStatus 
        })
    })
    .then(response => response.json())
    .then(result => {
        if (event.target.value === 'Follow') {
            followers = parseInt(followers) + 1
            document.querySelector('#followers').textContent = `${parseInt(followers)} Followers`;
            event.target.value = 'Following';
        } else {
            followers = parseInt(followers) - 1
            document.querySelector('#followers').textContent = `${parseInt(followers)} Followers`;
            event.target.value = 'Follow';
        }
    })
    

}

function closeModal() {
  const dialog = document.querySelector('.modal')
  dialog.close()
}