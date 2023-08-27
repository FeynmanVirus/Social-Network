document.addEventListener('DOMContentLoaded', function() {
    likeBtn = document.getElementsByClassName('likes-btn')
    for (let i = 0; i < likeBtn.length; i++) {
        likeBtn[i].addEventListener('click', function() {
            likeBtn[i].classList.toggle('press')
            likePost(likeBtn[i])
        })
    }
})

function likePost(btn) {
    postID = btn.parentElement.dataset.postid
    if (btn.classList[1] === 'press') {
        likeStatus = 'liked'
    } else {
        likeStatus = 'unliked'
    }
    console.log(postID)
    fetch(`/likepost/${postID}`, {
        method: 'POST',
        body: JSON.stringify({
            likeStatus: likeStatus 
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result['likes'])
        likesNumbers = document.querySelector(`[data-postid="${postID}"] > .likes-no`)
        likesNumbers.innerText = result['likes']
    })
    
   
}