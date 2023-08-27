document.addEventListener('DOMContentLoaded', function() {
    try{
    document.querySelector('#follow-btn').addEventListener('click', followUser);     
    } catch (TypeError) {

    }
    document.querySelector('#followers').textContent = `${parseInt(followers)} Followers`
    document.querySelector('#following').textContent = `${parseInt(following)} Following`
})

function followUser(event) {
    event.preventDefault();
    followStatus = event.target.value
    console.log(event.target.value)
    userToFollow = document.querySelector('#profile-username').textContent;
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