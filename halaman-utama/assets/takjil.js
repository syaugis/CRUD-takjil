$(document).ready(function(){
    /* make side menu show up */
    $(".trigger").click(function(){
        $(".menuWrap").fadeIn(180);
        $(".menu").animate({opacity: '1', left: '0px'}, 180);
    });

    /* make config menu show up */
    $(".cn").click(function(){
        $(".config").animate({opacity: '1', right: '0px'}, 180);
        /* hide others */
        $(".menuWrap").fadeOut(180);
        $(".menu").animate({opacity: '0', left: '-320px'}, 180);
    });
        
    //This also hide everything, but when people press ESC
    $(document).keydown(function(esc) {
        if (esc.keyCode == 27) {
            $(".menuWrap").fadeOut(180);
            $(".menu").animate({opacity: '0', left: '-320px'}, 180);
            $(".config").animate({opacity: '0', right: '-200vw'}, 180);
        }
    });

    $(".rightPanel").click(function(){
        $(".menuWrap").fadeOut(180);
        $(".menu").animate({opacity: '0', left: '-320px'}, 180);
    });

    $(".rightPanel, .leftPanel").click(function(){
        $(".config").animate({opacity: '0', right: '-200vw'}, 180);
    });

    $(".leftPanel").mouseenter(function(){
        $("#createEntity").animate({opacity: '1', bottom: '20px'}, 180);
    });

    $(".leftPanel").mouseleave(function(){
        $("#createEntity").animate({opacity: '0', bottom: '-70px'}, 180);
    });
    
    /* small conversation menu */
    $(".otherOptions").click(function(){
        $(".moreMenu").slideToggle("fast");
    });

    /* clicking the search button from the conversation focus the search bar outside it, as on desktop */
    $( ".search" ).click(function() {
        $( ".searchChats" ).focus();
    });

    $("#createEntity").click(function(){
        let nama = prompt("Masukkan nama Masjid");
        let alamat = prompt("Masukkan alamat Masjid");
        createEntity(nama, alamat);
    });
});

function openData(evt, namaData){
    // $(".dataSect").css("display", "none");
    console.log(evt);
    $(".listButton").removeClass(" active");
    evt.currentTarget.className += " active";
    $(".newDataSect").css("display", "none");
    document.getElementById(namaData).style.display = "block";
}

function createEntity(name, alamat){
    let id = name.split('').filter(e => e.trim().length).join('');
    let listButton = `<div onClick="openData(event, '${id}')" class="listButton">`+
    '<div class="listInfo">'+
    '<div class="image"></div>'+
    `<p class="name">${name}</p>`+
    `<p class="alamat">${alamat}</p>`+
    '</div>'+'</div>';
    $(".titleList").append(listButton);

    let newDataSect = `<section id="${id}" class="newDataSect">`+
    '<div class="topBar">'+'<div class="leftSide">'+
    `<p class="nama">${name}</p>`+`<p class="alamat">${alamat}</p>`+
    '</div></div>'+'<div class="data userBg">'+ // tables goes here
    '</div></section>';
    $(".rightPanel").append(newDataSect);
    $(`#${id}`).css("display", "none");
}
