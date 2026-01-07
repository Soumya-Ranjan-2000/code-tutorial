function LoadPage(pageName){
    $.ajax({
        method: "get",
        url: pageName,
        success: (response)=> {
            $("section").html(response);
        }
    })
}

$(function(){
    // --- Admin Sign In button loads login page ---
    $("#btnSignIn").click(()=>{
        LoadPage("user-login.html");
    })

    // --- Load videos into dashboard ---
    function LoadVideos(){
        $("section").html("");
        $.ajax({
            method:"get",
            url: "http://127.0.0.1:6600/getvideos",
            success: (videos)=> {
                $("tbody").empty();
                videos.map(video=>{
                    $(`<tr>
                          <td>${video.Title}</td>
                          <td><iframe src=${video.Url} width="200" height="100"></iframe></td>
                          <td> 
                            <button id="btnEdit" name=${video.VideoId} class="btn btn-warning bi bi-pen-fill"></button>  
                            <button id="btnDelete" name=${video.VideoId} class="btn btn-danger bi bi-trash-fill"></button>  
                          </td>
                        </tr>`).appendTo("tbody");
                })
            }
        })
    }

    // --- Admin Login ---
    $(document).on("click", "#btnLogin", ()=> {
        $.ajax({
            method: 'get',
            url: 'http://127.0.0.1:6600/getadmin',
            success: (users)=> {
                var user = users.find(admin=> admin.UserId==$("#LoginUserId").val());
                if(user && user.UserId==$("#LoginUserId").val() && user.Password==$("#LoginPassword").val()) {
                    // Mark admin as logged in
                    sessionStorage.setItem("adminLoggedIn", true);

                    // Replace Sign In button with Sign Out
                    $("#btnSignIn").replaceWith(`<button class="btn btn-danger" id="btnSignOut">Sign Out</button>`);

                    // Load dashboard + videos
                    LoadPage('admin-dashboard.html');
                    LoadVideos();
                } else {
                    alert(`Invalid Admin Details`);
                }
            }
        })
    });

    // --- Admin Sign Out ---
    $(document).on("click", "#btnSignOut", ()=>{
        // Clear session
        sessionStorage.removeItem("adminLoggedIn");

        // Reset header button back to Sign In
        $(".d-flex header button").remove(); // remove current button
        $("header").append(`<button class="btn btn-light bi bi-person-fill" id="btnSignIn"> Sign In</button>`);

        // Clear section content
        $("section").html("");

        // Redirect to Admin Home page
        window.location.href = "admin-index.html";
    });

    // --- Load categories for dropdown ---
    function LoadCategories(){
        $.ajax({
            method:'get',
            url:'http://127.0.0.1:6600/getcategories',
            success: (categories)=> {
                $("#lstCategories").empty();
                categories.map(category=>{
                    $(`<option value=${category.CategoryId}>${category.CategoryName}</option>`).appendTo("#lstCategories");
                })
            }
        })
    }

    // --- Add New Video ---
    $(document).on("click","#btnAddNew",()=>{
        LoadPage('admin-add-video.html');
        LoadCategories();
    })

    // --- Add Video ---
    $(document).on("click","#btnAddVideo",()=>{
        var video = {
            VideoId: $("#VideoId").val(),
            Title: $("#Title").val(),
            Url: $("#Url").val(),
            Likes: $("#Likes").val(),
            Views: $("#Views").val(),
            CategoryId: $("#lstCategories").val()
        };
        $.ajax({
            method: 'post',
            url: 'http://127.0.0.1:6600/addvideo',
            data: video
        })
        alert('Video Added Successfully..');
        LoadPage('admin-dashboard.html');
        LoadVideos();
    })

    var id;
    // --- Edit Video ---
    $(document).on("click","#btnEdit",(e)=>{
        LoadPage('admin-edit-video.html');
        LoadCategories();
        id = parseInt(e.target.name);

        $.ajax({
            method:'get',
            url: `http://127.0.0.1:6600/getvideo/${id}`,
            success: (video)=> {
                $("#VideoId").val(video[0].VideoId);
                $("#Title").val(video[0].Title);
                $("#Url").val(video[0].Url);
                $("#Likes").val(video[0].Likes);
                $("#Views").val(video[0].Views);
                $("#lstCategories").val(video[0].CategoryId);
            }
        })
    })

    // --- Cancel Edit ---
    $(document).on("click","#btnCancel",()=>{
        LoadPage('admin-dashboard.html');
        LoadVideos();
    })

    // --- Update Video ---
    $(document).on("click","#btnUpdateVideo",()=>{
        var video = {
            VideoId: $("#VideoId").val(),
            Title: $("#Title").val(),
            Url: $("#Url").val(),
            Likes: $("#Likes").val(),
            Views: $("#Views").val(),
            CategoryId: $("#lstCategories").val()
        };
        $.ajax({
            method: 'put',
            url: `http://127.0.0.1:6600/updatevideo/${id}`,
            data: video
        })
        alert("Video Updated..");
        LoadPage("admin-dashboard.html");
        LoadVideos();
    })

    // --- Delete Video ---
    $(document).on("click", "#btnDelete", (e)=>{
        var id = parseInt(e.target.name);
        var flag = confirm("Are you sure?\nWant to Delete?");
        if(flag==true) {
            $.ajax({
                method:'delete',
                url: `http://127.0.0.1:6600/deletevideo/${id}`
            })
            alert("Video Deleted Successfully..");
            LoadPage("admin-dashboard.html");
            LoadVideos();
        }
    })
})
