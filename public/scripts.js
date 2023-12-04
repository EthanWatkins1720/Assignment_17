let count = 0;
let toggle = false;

const addAlbum = async (e) => {
    e.preventDefault();

    const form = document.getElementById("add-album-form");
    const formData = new FormData(form);
    
    let response;
    
    // For new albums
    if (form._id.value == -1) {
        formData.delete("_id");
        formData.append("members", getMembers());
        // console.log(...formData);
        response = await fetch("/api/data", {
            method: "POST",
            body: formData
        });
    } 
    else {
        // Existing album
        response = await fetch(`/api/data/${form._id.value}`, {
            method: "PUT",
            body: formData
        });
    }

    // Error
    if(response.status != 200) {
        // console.log(response);
        return;
    }

    response = await response.json();

    if (form._id.value != -1) {

    }
    addShowHide;
    resetForm();
    showAlbums();
};

const resetForm = () => { 
    const form = document.getElementById("add-album-form");
    form.reset();
    form._id = "-1";
    count = 0;
    document.getElementById("album-list-left").innerHTML = "";
    document.getElementById("album-list-center").innerHTML = "";
    document.getElementById("album-list-right").innerHTML = "";
}

const getMembers = () => {
    const inputs = document.querySelectorAll("#band-members-div input")
    const members = [];

    inputs.forEach((input) => {
        members.push(input.value);
    });

    return members;
}

const showAlbums = async() => {
    let response;
    let albumJSON;

    try {
        response = await fetch("/api/data");
        albumJSON = await response.json();  
    } catch (error) {
        console.log("Error retrieving JSON")
    }

    let albumDivLeft = document.getElementById("album-list-left");
    let albumDivCenter = document.getElementById("album-list-center");
    let albumDivRight = document.getElementById("album-list-right");

    albumJSON.forEach((album) => {
        let section = document.createElement("section");
        
        if (count % 3 == 0) {
            albumDivLeft.append(section);
        }
        if (count % 3 == 1) {
            albumDivCenter.append(section);
        }
        if (count % 3 == 2) {
            albumDivRight.append(section);
        }

        count++;
        
        let h2 = document.createElement("h2");
        section.append(h2);
        h2.innerHTML = album.name;

        let img = document.createElement("img");
        img.classList.add("cover");
        section.append(img);
        img.src= album.cover;

        let band = document.createElement("p");
        section.append(band);
        band.innerHTML = "Band: " + album.band;

        let genre = document.createElement("p");
        section.append(genre);
        genre.innerHTML = "Genre: " + album.genre;

        let year = document.createElement("p");
        section.append(year);
        year.innerHTML = "Release year: " + album.year;

        let membersTitle = document.createElement("p");
        section.append(membersTitle);
        membersTitle.innerHTML = "Band members: ";

        let members = document.createElement("ul");
        section.append(members);
        for (mem in album.members) {
            let member = document.createElement("li");
            member.innerText = album.members[mem];
            members.append(member);
        }

        let buttonDiv = document.createElement("div");
        section.append(buttonDiv);

        let editButton = document.createElement("a");
        editButton.href = "#";
        editButton.innerHTML = "&#9998";
        editButton.classList.add("edit-button");
        buttonDiv.append(editButton);

        let deleteButton = document.createElement("a");
        deleteButton.href = "#";
        deleteButton.innerHTML = "X";
        deleteButton.classList.add("delete-button");
        buttonDiv.append(deleteButton);

        let realDeleteButtonDiv = document.createElement("div");
        realDeleteButtonDiv.classList.add("real-delete-button-div");
        section.append(realDeleteButtonDiv);

        

        editButton.onclick = (e) => {
            e.preventDefault();
            document.getElementById("add-album-box").style.display = "block";
            document.getElementById("add-album-title").innerHTML = "Edit Album";
            populateEditForm(album);
        }

        deleteButton.onclick = (e) => {
            e.preventDefault();
            deleteCheck(album);
        }
    });
};

const deleteCheck = (album) => {
    document.getElementById("real-delete-button-div").style.display = "block";
    document.getElementById("real-delete-button").onclick = (e) => {
        e.preventDefault();
        deleteAlbum(album);
    }
    document.getElementById("cancel-button").onclick = (e) => {
        e.preventDefault();
        document.getElementById("real-delete-button-div").style.display = "none";
    }
}

const deleteAlbum = async (album) => {
    
    
    let response = await fetch(`/api/data/${album._id}`, {
        method: "DELETE", 
        headers: {
            "Content-Type":"application/json;charset=utf-8",
        }
    });

    if (response.status != 200) {
        console.log("Error deleting");
        return;
    }

    let result = await response.json();
    document.getElementById("real-delete-button-div").style.display = "none";
    showAlbums();
    resetForm();

}

const addShowHide = () => {
    if (toggle) {
        document.getElementById("add-album-box").style.display = "none";
        toggle = false;
    } else if (toggle == false) {
        document.getElementById("add-album-box").style.display = "block";
        toggle = true;
    }
};

const addMember = (e) => {
    e.preventDefault();
    const memberDiv = document.getElementById("band-members-div");
    const input = document.createElement("input");
    input.type = "text";
    memberDiv.append(input);
}

const populateEditForm = (album) => {
    const form = document.getElementById("add-album-form");
    form._id.value = album._id;
    form.name.value = album.name;
    form.band.value = album.band;
    form.year.value = album.year;
    form.genre.value = album.genre;

    //add members
    populateMembers(album.members);
}

const populateMembers = (members) => {
    const memberDiv = document.getElementById("band-members-div");
    members.forEach((member) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = member;
        memberDiv.append(input);
    });
}

window.onload = () => {
    count = 0;
    toggle = false;
    showAlbums();
    document.getElementById("add-button").onclick = addShowHide;
    document.getElementById("band-members-button").onclick = addMember;
    document.getElementById("add-album-form").onsubmit = addAlbum;
};