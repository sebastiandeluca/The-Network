// Note: For the existing posts in the DB, I messed around with the likers of
//       the post for the YouTube video submission to make it seem like more 
//       users were on the platform, and as a result, liking and unliking those
//       specific posts are a little glitchy. Any post created by you should
//       work as expected.

document.addEventListener('DOMContentLoaded', function() {
    try {
        username = document.querySelector('#post-create-username').value;
        document.querySelector('#new-post-maker').addEventListener('submit', () => {
        
            post_content = document.querySelector('#content-body').value;
            fetch('/posts/create', {
                method: 'POST',
                body: JSON.stringify({
                    content: post_content,
                    author: username
                })
            })
            .then(response => {
                update()
                })
        });
        document.querySelector('#user-profile').addEventListener('click', function(event) {
            view_profile(username)
            event.preventDefault();
        });
        document.querySelector('#following-tab').addEventListener('click', () => view_following(username,1))
    } catch (TypeError) {
    }

    load_home()
})

function view_profile(username) {
    window.scrollTo(0,0);
    document.querySelector('#profile').innerHTML = "";
    document.querySelector('#profile-posts').innerHTML = "";
    try {
        users_username = document.querySelector('#post-create-username').value;
    }
    catch(TypeError){
        users_username = "notsignedin"
    }
    
    document.querySelector('#home-page').style.display = 'none';
    document.querySelector('#profile-page').style.display = 'block';
    fetch(`/profile/${username}`)
    .then(response => response.text())
    .then(user => {
        userdata = JSON.parse(user)
        username = userdata[0]
        const profile = document.createElement('div');
        try {
            followers = username.followers.split(',');
            following = username.following.split(",");
        } catch (TypeError) {
            followers = [];
        }

        profile.setAttribute('id', 'profile-main');
        followers = username.followers.split(",");
        profile.innerHTML = `<h3>${username.username}'s Profile</h3>`
        profile.innerHTML += `<p id="followers">${followers.length - 1} Followers | ${following.length - 1} Following </p>` 
        profile.innerHTML += `<p> ${username.posts} Posts </p><br>`

        if (username.username == users_username || users_username == "notsignedin"){
        }
        else {
            // Another User's Profile
            if (followers.indexOf(users_username) > -1) {
                profile.innerHTML += `<button id="unfollow-btn" value=${username.username}>Unfollow</button>`
               
            }
            else {
                profile.innerHTML += `<button id="follow-btn" value=${username.username}>Follow</button>`
               

            }

            
        }
        
        fetch(`posts/${username.username}`)
        .then(response => response.json())
        .then(posts => {
            for (p in posts) {
                let id = posts[p].id
                likelist = posts[p].likes.split(",");
                if (likelist == "") {
                    likelist.length = 0;
                }
                const newPost = document.createElement('div')
                newPost.setAttribute("id", "post")
                newPost.setAttribute("class", `a${posts[p].id}`)
                newPost.innerHTML = `<p id="post-content">${posts[p].content}</p>`
                newPost.innerHTML += `<a id="post-auth"><strong>by ${posts[p].author}</strong></a><br>`
                newPost.innerHTML += `<a id="timestampprof${posts[p].id}" class="timestamp" style=color:white;>on ${posts[p].timestamp} | ${likelist.length} Likes</a>`
                try {
                    if (users_username == posts[p].author) {
                        newPost.innerHTML += `<button id="edit-btn" class="edit-btn" value=${posts[p].id}> Edit Post </button>`
                    }
                    if (likelist.indexOf(users_username) > -1) {
                        newPost.innerHTML += `<button id="unlike" class="lprof${id}" value=${users_username}> Unlike Post </button>`
                    }
                    else {
                        newPost.innerHTML += `<button id="like" class="lprof${id}" value=${users_username}> Like Post </button>`
                    }
                }
                catch (TypeError) {
                    newPost.innerHTML += `<p style=color:white;> Sign-In Required to Like Posts </p> ` 
                }
                document.querySelector('#profile-posts').append(newPost)
                newPost.querySelector(`.lprof${id}`).addEventListener('click', () => {toggleLike(id,true)})
            try {
                newPost.querySelector('#edit-btn').addEventListener('click', () => {edit_post(id)})
            } catch (TypeError) {
                
            }
            } 
        })
        document.querySelector('#profile').append(profile);
        try {
            document.querySelector('#unfollow-btn').addEventListener('click', () => unfollow_user(username.username))
        }
        catch (TypeError) {

        }
        try {
            document.querySelector('#follow-btn').addEventListener('click', () => follow_user(username.username))
        }
        catch(TypeError) {

        }
        
    })
    
    }

function update(page_num) {
    document.querySelector("#navbtns").innerHTML = "";
    try {
        username = document.querySelector('#post-create-username').value;
    }
    catch (TypeError) {

    }
    fetch(`/posts${page_num}`)
    .then(response => response.json())
    .then(posts => {
        for (p in posts) {
            let auth = posts[p].author
            let id = posts[p].id
            likelist = posts[p].likes.split(",");
            if (likelist == "") {
                likelist.length = 1;
            }
            const newPost = document.createElement('div')
            newPost.setAttribute("id", "post")
            newPost.setAttribute("class", `a${posts[p].id}`)
            
            newPost.innerHTML = `<p id="post-content">${posts[p].content}</p>`
            newPost.innerHTML += `<a id="post-auth"><strong>by ${posts[p].author}</strong></a><br>`
            newPost.innerHTML += `<a id="timestamp${posts[p].id}" style=color:white;>on ${posts[p].timestamp} | ${likelist.length - 1} Likes</a>`
            try {
                if (username == posts[p].author) {
                    newPost.innerHTML += `<button id="edit-btn" class="edit-btn" value=${posts[p].id}> Edit Post </button>`
                }
                if (likelist.indexOf(username) > -1) {
                    newPost.innerHTML += `<button id="unlike" class="l${posts[p].id}"> Unlike Post </button>`
                }
                else {
                    newPost.innerHTML += `<button id="like" class="l${posts[p].id}"> Like Post </button>`
                }
            }
            catch (TypeError) {
                newPost.innerHTML += `<p style=color:white;> Sign-In Required to Like Posts </p> ` 
            }
            
            document.querySelector('#posts').append(newPost)
            newPost.querySelector('#post-auth').addEventListener('click', () => {view_profile(auth)})
            
            try {
                newPost.querySelector(`.l${id}`).addEventListener('click', () => {toggleLike(id, false)})
                newPost.querySelector('#edit-btn').addEventListener('click', () => {edit_post(id)})
            } catch (TypeError) {
                
            }
            
        
        }    
    })
    create_navbar(false)
}

function create_navbar(followed) {
    try {
        username = document.querySelector('#post-create-username').value;
    }
    catch (TypeError) {
    }
    fetch('/posts/all')
    .then(response => response.json())
    .then(all_posts => {
        const navigation = document.querySelector("#navbtns");
        const num_of_btns = all_posts.length / 10;
        for (let pages = 0; pages < num_of_btns; pages++) {
            let page_number = pages + 1
            const newBtn = document.createElement('li');
            newBtn.setAttribute('class', "page-item");
            const newLink = document.createElement('a');
            newLink.setAttribute('class', 'page-link');
            newLink.setAttribute('href', "#");
            newLink.innerHTML = pages + 1;
            newBtn.appendChild(newLink);
            navigation.append(newBtn);
            newBtn.addEventListener('click', function() {
                document.querySelector('#posts').innerHTML = "";
                if (followed) {
                    view_following(username, page_number)
                }
                else {
                    update(page_number)
                }
                
                
            })
        }
    })
}

function load_home() {
    document.querySelector('#home-page').style.display = 'block';
    update(1)
    
}

function view_following(username,page_num){
    document.querySelector("#profile-page").style.display = 'none';
    document.querySelector("#navbtns").innerHTML = "";
    document.querySelector("#new-post-container").style.display = 'none';
    document.querySelector('#home-page').style.display = 'block';
    document.querySelector("#posts").innerHTML = `<h4 id="followingpage"> Following </h4><br>`;
    fetch(`/posts/${username}/following/${page_num}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts)
        for (p in posts) {
            let auth = posts[p].author
            likelist = posts[p].likes.split(",");
            if (likelist == "") {
                likelist.length = 0;
            }
            const newPost = document.createElement('div')
            newPost.setAttribute("id", "post")
            newPost.setAttribute("class", `a${posts[p].id}`)
            newPost.addEventListener('click', () => {view_profile(auth)})
            newPost.innerHTML = `<p id="post-content">${posts[p].content}</p>`
            newPost.innerHTML += `<a id="post-auth"><strong>by ${posts[p].author}</strong></a><br>`
            newPost.innerHTML += `<a id="timestamp">on ${posts[p].timestamp} | ${likelist.length} Likes</a><br>`
            try {
                if (username == posts[p].author) {
                    newPost.innerHTML += `<button id="edit-btn" class="edit-btn" value=${posts[p].id}> Edit Post </button>`
                }
                if (likelist.indexOf(username) > -1) {
                    newPost.innerHTML += `<button id="unlike" class="like-btn" value={{ user.username }}> Unlike Post </button>`
                }
                else {
                    newPost.innerHTML += `<button id="like" class="like-btn" value={{ user.username }}> Like Post </button>`
                }
            }
            catch (TypeError) {
                newPost.innerHTML += `<p style=color:white;> Sign-In Required to Like Posts </p> ` 
            }
            
            document.querySelector('#posts').append(newPost)
            
        }    
    })
    create_navbar(true)
}

function follow_user(username) {
    fetch(`/user/follow_${username}`)
    .then(response => response.json())
    fetch(`/user/${username}/updatefollowcount`, {
        method: 'GET'})
    .then(response => response.json())
    .then(followcount => {
        view_profile(username)
    })
}

function unfollow_user(username) {

    fetch(`/user/unfollow_${username}`)
    .then(response => response.json())
    fetch(`/user/${username}/updatefollowcount`, {
        method: 'GET'})
    .then(response => response.json())
    .then(followcount => {
        view_profile(username)
    })
}

function edit_post(id) {
    username = document.querySelector('#post-create-username').value;
    fetch(`posts/${id}/edit`, {
        method: "GET"
    })
    .then(response => response.json())
    .then(post => {
        token = document.querySelector("#mytoken").value;
        const editPost = document.querySelector(`.a${id}`)
        editPost.innerHTML = `<form id="post-edit">`
        editPost.innerHTML += `<input type="hidden" name="csrfmiddlewaretoken" value={% csrf_token %}>`
        editPost.innerHTML += `<textarea id="edited-content-body" class="edited_content" name="body">${post[0].content}</textarea>`
        editPost.innerHTML += `<a id="post-auth"><strong>Editing Your Post</strong></a><br>`
        editPost.innerHTML += `<a id="timestamp" style=color:white;> Your edits will not notify others.</a>`
        editPost.innerHTML += `<input type="submit" class="e${id}" id="edit-btn" value="Save Edit" name="edit">`
        editPost.innerHTML += `</form>`
        const csrftoken = getCookie('csrftoken');
        document.querySelector(`.e${id}`).addEventListener('click', () => {
            content = document.querySelector("#edited-content-body").value;
            fetch(`posts/${id}/edit`, {
                method: "POST",
                body: JSON.stringify({
                    content: content
                }),
                headers: {"X-CSRFToken": csrftoken }
    
            })
            .then(response => response.json())
            .then(post => {
                
                likelist = post[0].likes.split(',')
                content = document.querySelector("#edited-content-body")
                content.removeAttribute("#edited-content-body")
                content.setAttribute('id', 'content-body')
                editPost.innerHTML = `<p id="post-content">${post[0].content}</p>`
                editPost.innerHTML += `<a id="post_auth" style=color:white;><strong>by ${post[0].author}</strong></a><br>`
                editPost.innerHTML += `<a id="timestamp${post[0].id}" style=color:white;>on ${post[0].timestamp} | ${likelist.length - 1} Likes</a>>`
                editPost.innerHTML += `<button id="edit-btn" class="edit-btn" value=${post[0].id}> Edit Post </button>`
                if (likelist.indexOf(username) > -1) {
                    editPost.innerHTML += `<button id="unlike" class="l${post[0].id}"> Unlike Post </button>`
                }
                else {
                    editPost.innerHTML += `<button id="like" class="l${post[0].id}"> Like Post </button>`
                }
            })
        })
    })
    
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function toggleLike(post,profile) {
    if (profile) {
        console.log("IF PROFILE")
        var btn = document.querySelector(`.lprof${post}`);
        var tme = document.querySelector(`#timestampprof${post}`);
        button = btn;
        timest = tme;
    }
    else {
        console.log("NOT PROFILE")
        var btn = document.querySelector(`.l${post}`);
        var tme = document.querySelector(`#timestamp${post}`);
        button = btn;
        timest = tme;
    }
    var timest = timest
    if (button.textContent == " Unlike Post ") {
        button.textContent = " Like Post "
        button.id = "like"
        fetch(`posts/unlike/${post}`)
        .then(response => response.json())
        .then(post => {
            try {
                likelist = post[0].likes.split(",");
            }
            catch (TypeError) {
                likelist.length = 1;
            }
            timest.innerHTML =`<a id="timestamp">on ${post.timestamp} | ${likelist.length - 1} Likes</a>`;
           
        })
    }
    else {
        button.textContent = " Unlike Post "
        button.id = "unlike"
        fetch(`posts/like/${post}`)
        .then(response => response.json())
        .then(post => {
            try {
                likelist = post.likes.split(",");
            }
            catch (TypeError) {
                likelist.length = 1;
            }
            timest.innerHTML =`<a id="timestamp">on ${post.timestamp} | ${likelist.length - 1} Likes</a>`;
        })
    }
}