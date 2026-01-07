function LoadPage(pageName){
    $.ajax({
        method: "get",
        url: pageName,
        success: (response)=> {
            $("section").html(response);
        },
        error: ()=>{
            alert("❌ Failed to load page: " + pageName);
        }
    });
}

$(function(){

    $("#passwordContainer").hide();
    let quickLoginEmail = "";

    // --- Navigation links ---
    $(document).on("click", "#navHome", ()=>{
        window.location.href = "index.html";
    });

    $(document).on("click", "#navAbout", ()=>{
        window.location.href = "about.html";
    });

    $(document).on("click", "#navContact", ()=>{
        window.location.href = "contact.html";
    });

    $(document).on("click", "#navVideos", ()=>{
        window.location.href = "user-register.html";
    });

    // --- Existing Signin/Login/Register functionality ---
    $("#signin").click(()=> {
        LoadPage("user-login.html");
    });

    $("#btnGetStarted").click(()=>{
        quickLoginEmail = $("#Email").val().trim();
        if(!quickLoginEmail){
            alert("⚠️ Please enter your email address!");
            return;
        }
        $.ajax({
            method: "get",
            url: "http://127.0.0.1:6600/getusers",
            success: (users)=> {
                const user = users.find(item => item.Email === quickLoginEmail);
                if(user){
                    $("#passwordContainer").show();
                    $("#emailContainer").hide();
                    $("#error").hide();
                } else {
                    $("#error").html(`
                        <div class="mt-4">
                          User Doesn't Exist - 
                          <button class="btn btn-light" id="lnkRegister">Register</button>
                        </div>
                    `);
                }
            },
            error: ()=>{
                alert("❌ Could not fetch users. Please try again later.");
            }
        });
    });

    $("#btnSignIn").click(()=>{
        $.ajax({
            method: "get",
            url: "http://127.0.0.1:6600/getusers",
            success:(users)=> {
                const user = users.find(item => item.Email === quickLoginEmail);
                if(user){
                    if(user.Password === $("#Password").val()){
                        alert("✅ Login Success");
                        $("#passwordContainer").hide();
                        $("#signin").html(`${user.UserName} - Signout`);
                        LoadVideos();
                    } else {
                        alert("❌ Invalid Password");
                    }
                }
            },
            error: ()=>{
                alert("❌ Could not verify login. Please try again.");
            }
        });
    });

    $(document).on("click", "#lnkRegister",()=>{
        window.location.href = "user-register.html";
    });

    $(document).on("click", "#btnRegister",()=>{
        const userId = $("#UserId").val().trim();
        const userName = $("#UserName").val().trim();
        const password = $("#RPassword").val().trim();
        const email = $("#REmail").val().trim();
        const mobile = $("#Mobile").val().trim();

        if(!userId || !userName || !password || !email || !mobile){
            alert("⚠️ All fields are required!");
            return;
        }
        if(!/^\S+@\S+\.\S+$/.test(email)){
            alert("⚠️ Please enter a valid email address!");
            return;
        }
        if(!/^\d{10}$/.test(mobile)){
            alert("⚠️ Mobile number must be 10 digits!");
            return;
        }

        const user = { UserId: userId, UserName: userName, Password: password, Email: email, Mobile: mobile };

        $.ajax({
            method:"post",
            url: "http://127.0.0.1:6600/adduser",
            data: user,
            success: ()=>{
                alert("✅ Registered Successfully!");
                window.location.href = "index.html"; // back to home after register
            },
            error: ()=>{
                alert("❌ Registration failed. Try again.");
            }
        });
    });

    $(document).on("click", "#btnCancel", ()=>{
        window.location.href = "index.html";
    });

    function LoadVideos(){
        $("section").html("");
        $.ajax({
            method: "get",
            url: "http://127.0.0.1:6600/getvideos",
            success: (videos)=>{
                if(!videos || videos.length === 0){
                    $("<p class='text-center text-muted'>No videos available yet.</p>").appendTo("section");
                } else {
                    videos.forEach(video=>{
                        $(`
                          <div class="box mb-3">
                            <iframe height="200" src="${video.Url}" class="card-img-top"></iframe>
                            <div class="fw-bold mt-2">${video.Title}</div>
                          </div>
                        `).appendTo("section");
                    });
                }
            },
            error: ()=>{
                alert("❌ Could not load videos. Please try again later.");
            }
        });
    }

    $(document).on("click", "#btnLogin", ()=> {
        const loginUserId = $("#LoginUserId").val().trim();
        const loginPassword = $("#LoginPassword").val().trim();

        if(!loginUserId || !loginPassword){
            alert("⚠️ Please enter both User Id and Password!");
            return;
        }

        $.ajax({
            method:"get",
            url: "http://127.0.0.1:6600/getusers",
            success: (users) => {
                const user = users.find(item => item.UserId === loginUserId);
                if(user && user.Password === loginPassword){
                    LoadVideos();
                    $("#signin").html(`${user.UserName} <button id="btnSignout" class="btn btn-warning">Signout</button>`);
                } else {
                    alert("❌ Invalid User Name or Password");
                }
            },
            error: ()=>{
                alert("❌ Could not verify login. Please try again.");
            }
        });
    });

    $(document).on("click", ".join-course", ()=>{
        window.location.href = "user-register.html";
    });

    $(document).on("click", "#btnSignout", ()=>{
        location.reload();
    });

});
