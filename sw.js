this.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("v1").then(function (cache) {
      return cache.addAll([
        "resource/drop.png",
        "resource/dropc1.png",
        "resource/dropc2.png",
        "resource/dropc3.png",
        "resource/dropc4.png",
        "resource/dropc5.png",
        "resource/dropc6.png",
        "resource/dropc7.png",
        "resource/dropc8.png",
        "resource/border.png",
      ]);
    })
  );
});
