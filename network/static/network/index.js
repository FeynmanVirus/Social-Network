document.addEventListener('DOMContentLoaded', function() {
    // document.querySelector('#id_text').addEventListener('keyup', textAreaAdjust);
    try {
    document.querySelector('#newpost-form').addEventListener('submit', newPost);     
    } catch (TypeError) {
    }
    try {
    document.querySelector('#id_text').value = '';
    } catch (error) {
    }
    try {
        const editPostBtn = document.querySelectorAll('.edit-post')
        for (let i = 0; i < editPostBtn.length; i++) {
            editPostBtn[i].addEventListener('click', editPost)
        }
    } catch (TypeError) {
    }
})

function editPost(event) {
    const btn = event.target
    const div = btn.closest('div')
    const orig_divHTML = div.innerHTML
    const postContent = div.getElementsByClassName('post-content')[0].textContent
    const postID = div.getElementsByClassName('likes-number')[0].dataset.postid
    console.log(orig_divHTML)
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
            <span class="likes-number" data-postid="13"><i class="likes-btn"></i>${result['likes']}</span>
        `
        div.innerHTML = divHTML;
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