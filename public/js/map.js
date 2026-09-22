    const map = new mapboxgl.Map({
        accessToken: mapToken,
        container: 'map', // container ID
        // style: "mapbox://styles/mapbox/dark-v11",
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });
     
    const marker1 = new mapboxgl.Marker({color : "red"})
        .setPopup(new mapboxgl.Popup({offset: 25})    
        .setHTML(`<h4>${listing.location}</h4><p>Exact location provided after booking</p>`))
        .setLngLat(listing.geometry.coordinates)
        .addTo(map);