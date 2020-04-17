function setName() {
    var name = prompt("What's your name?", "Donald Duck");
    document.cookie="userName=" + name;
}
function checkName() {
    return true;
}
function getName() {
    return document.cookie;
}
function welcomeIfKnown() {
    if (getName() === "") {
        setName();
    } else {
        welcome();
    }
}
function welcome() {
    alert("Hi " + getName()  + ". Howzit?");
}
welcomeIfKnown();
