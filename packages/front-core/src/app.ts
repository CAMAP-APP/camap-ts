/*
This is not the root of the frontend app!

This module has been created to migrate the funcitons
formerly implmented in the HaXe/react frontend
it is called app to mirror the previous App.hx entrypoint
*/

function clearNotifications() {
    const notifications = document.getElementById('notifications');
    if (notifications) {
        notifications.innerHTML = '';
    }
}

// while there is both HaXe and TS fronts, let HaXe setup the _Camap global object
if (typeof window !== 'undefined') {
    window._Camap = window._Camap || {};
    window._Camap.clearNotifications = clearNotifications;
}