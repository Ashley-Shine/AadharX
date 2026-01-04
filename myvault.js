function openvault(){

    access = document.getElementById("vaultaccess").value;
    if (access == "12345678"){
        console.log("Access Granted");

        window.location.href = "citizen.html";
    }
}

document.getElementById("abutton").addEventListener("click", openvault);