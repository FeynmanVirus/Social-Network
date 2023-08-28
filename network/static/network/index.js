document.addEventListener('DOMContentLoaded', function() {
    // newpost form
    try {
    document.querySelector('#newpost-form').addEventListener('submit', newPost);     
    } catch (TypeError) {
    }
    // empty the new_post textarea
    try {
    document.querySelector('#id_text').value = '';
    } catch (error) {
    }
    //add listener to all edit buttons
    try {
        const editPostBtn = document.querySelectorAll('.edit-post')
        for (let i = 0; i < editPostBtn.length; i++) {
            editPostBtn[i].addEventListener('click', editPost)
        }
    } catch (TypeError) {
    }
    //add listener to all comment buttons
    try {
        const commentBtn = document.querySelectorAll('.add-comment')
        const dialog = document.querySelector('.modal')
        for (let i = 0; i < commentBtn.length; i++) {
            commentBtn[i].addEventListener('click', function() {
                dialog.showModal()
                showComments(commentBtn[i].parentElement.dataset.postid)
            })
        }
    } catch(error) {
    }
})

function showComments(postID) {
    // add listener to "Add Comment" button
    document.querySelector('#submit-comment').addEventListener('click', function() {
        addComment(postID)
    })
    // get comments
    fetch(`/comment/${postID}`)
    .then(response => response.json())
    .then(result => {
        console.log(result)
        const commentsDiv = document.querySelector('#comments')
        for (let i = 0; i < result.length; i++) {
        const div = document.createElement('div')
        if (result[1] === null || result[1].length == 0) {
            result[1] = [0]
        } 
        if (result[0].length == 0) {
            commentContent = `<h5>No comments yet. You can be the first.</h5>`
            div.innerHTML = commentContent
            commentsDiv.append(div)
            return;
        }
        if (result[1].includes(result[0][i]['id'])) {
        commentContent = `
            <span class="user-details"><a href="/profile/${result[0][i]['user']}">${result[0][i]['user']}</a><span class="date_created">${result[0][i]['time']} said</span></span>
            <span class="post-content">${result[0][i]['comment']}</span>
            <span class="likes-number" data-commentid="${result[0][i]['id']}"><i class="likes-comment-btn press"></i><span class="likes-no-comment">${result[0][i]['likes']}</span></span>
            `
        } else {
            commentContent = `
            <span class="user-details"><a href="/profile/${result[0][i]['user']}">${result[0][i]['user']}</a><span class="date_created">${result[0][i]['time']} said</span></span>
            <span class="post-content">${result[0][i]['comment']}</span>
            <span class="likes-number" data-commentid="${result[0][i]['id']}"><i class="likes-comment-btn"></i><span class="likes-no-comment">${result[0][i]['likes']}</span></span>
            `
        }
        div.innerHTML = commentContent
        commentsDiv.append(div)
        commentLikeBtn = document.querySelectorAll('.likes-comment-btn')
        for (let i = 0; i < commentLikeBtn.length; i++) {
            commentLikeBtn[i].addEventListener('click', function() {
            commentLikeBtn[i].classList.toggle('press')
            likeComment(postID, commentLikeBtn[i])
        })}
        
        }
    })
}

function addComment(postID) {
    comment_text = document.querySelector('#add-comment-box').value
    console.log(comment_text)
    console.log(postID)
    fetch(`/comment/${postID}`, {
        method: 'POST',
        body: JSON.stringify({
            comment_text: comment_text,
            postid: postID,
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result)
        const commentsDiv = document.querySelector('#comments')
        const div = document.createElement('div')
        commentContent = `
            <span class="user-details"><a href="/profile/${result['user']}">${result['user']}</a><span class="date_created">${result['time']} said</span></span>
            <span class="post-content">${comment_text}</span>
            <span class="likes-number" data-commentid="${result['id']}"><i class="likes-comment-btn"></i><span class="likes-no-comment">0</span></span>
            `
        div.innerHTML = commentContent
        commentsDiv.insertBefore(div, commentsDiv.firstChild)

        // remove "No comments yet msg"
        document.querySelector('h5').textContent = ''

        commentLikeBtn = document.querySelector('.likes-comment-btn')
        commentLikeBtn.addEventListener('click', function() {
            commentLikeBtn.classList.toggle('press')
            likeComment(postID, commentLikeBtn)
        })
    })
}

function likeComment(postID, btn) {
    commentID = btn.parentElement.dataset.commentid
    if (btn.classList[1] === 'press') {
        likeStatus = 'liked'
    } else {
        likeStatus = 'unliked'
    }
    console.log(likeStatus)
    fetch(`/likecomment/${postID}`, {
        method: 'POST',
        body: JSON.stringify({
            likeStatus: likeStatus,
            commentID: commentID
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result['likes'])
        likesNumbers = document.querySelector(`[data-commentid="${commentID}"] > .likes-no-comment`)
        console.log(likesNumbers)
        likesNumbers.innerText = result['likes']
    })
}

function closeModal() {
  const dialog = document.querySelector('.modal')
  document.querySelector('#comments').innerHTML = ''
  dialog.close()
}

function editPost(event) {
    const btn = event.target
    const div = btn.closest('div')
    const orig_divHTML = div.innerHTML
    const postContent = div.getElementsByClassName('post-content')[0].textContent
    const postID = div.getElementsByClassName('likes-number')[0].dataset.postid
    console.log(postID)
    const divContent = `
    <form id="edit-post-form" action="">
    <textarea class="edit-textarea">${postContent}</textarea>
    <p id="edit-msg" style="color: red;"></p>
    <input type="button" id="submit-edit" value="Edit" class="button-30 edit-btn">
    <input type="button" id="cancel-edit" value="Cancel" class="button-30 edit-btn">
    </form>`
    div.innerHTML = divContent

    document.querySelector('#cancel-edit').addEventListener('click', function() {
        div.innerHTML = orig_divHTML
        div.getElementsByClassName('edit-post')[0].addEventListener('click', editPost)
    })

    document.querySelector('#submit-edit').addEventListener('click', function() {
        edited_content = div.querySelector('.edit-textarea').value
        if (edited_content === postContent) {
            document.querySelector('#edit-msg').textContent = 'No edit detected, press Cancel to cancel'
            return;
        }
        editPostSubmit(postID, edited_content, div)
    })

}

function editPostSubmit(postID, edited_content, div) {
    console.log(postID)
    console.log(edited_content)
    fetch(`/editpost/${postID}`, {
        method: "POST",
        body: JSON.stringify({
            id: postID,
            edit_content: edited_content
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result)
        divHTML = `<span class="user-details"><a href="/profile/${result['user']}">${result['user']}</a><span class="date_created">Aug. 27, 2023, 10:57 a.m.</span></span>
            
              <button class="edit-post">Edit</button>
            
            <span class="post-content">${edited_content}</span>
            <span class="likes-number" data-postid="${postID}"><i class="likes-btn"></i><span class="likes-no">${result['likes']}</span><button class="add-comment">Comment</button></span>
        `
        div.innerHTML = divHTML;
        div.querySelector('.edit-post').addEventListener('click', editPost)
    })
}


function newPost(event) {
    console.log('called')
    event.preventDefault()
    fetch('/newpost', {
        method: 'POST',
        body: JSON.stringify({
            text_content: document.querySelector('#id_text').value,
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result)
        document.querySelector('#id_text').value = '';
        document.querySelector('#post-message').style.color = 'green';
        document.querySelector('#post-message').style.display = 'block';
        document.querySelector('#post-message').textContent = 'Post submitted successfully!';

        // show post on DOM
        const postDiv = document.createElement('div')
        postDiv.classList.add('post')
        const parentDiv = document.querySelector('#posts')
        newPostContent = `<span class="user-details"><a href="/profile/${result['user']}">${result['user']}</a><span class="date_created">${result['date']}</span></span>
            <span class="post-content">${result['content']}</span>
            <span class="likes-number" data-postid="${result['id']}"><i class="likes-btn"></i>0</span>`
        postDiv.innerHTML = newPostContent
        parentDiv.insertBefore(postDiv, parentDiv.firstChild);
    })
}