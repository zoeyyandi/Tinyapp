$(function() {
    const $form = `<form id="URLForm" method="POST" action="/urls">
    <label id='formLabel' for="longURL">Enter a URL:</label><br />
    <input id='inputLongURL' type="text" name="longURL" placeholder="http://" style="width: 300px">
    <input id='newURLbtn' type="submit" value="Submit">
  </form>`
    
  $("#shortenUrl").click(function(e){
        e.preventDefault()
        $('#clickhere').addClass('clicked')
        $(this).replaceWith($form)
  })

})