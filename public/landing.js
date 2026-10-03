// Old shared-page bookmarks remain usable after marketing/application separation.
if (
  ["#workbench", "#examples", "#results", "#detection-review"].includes(
    location.hash,
  )
) {
  location.replace("/workbench.html" + location.search);
}
