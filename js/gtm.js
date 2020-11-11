document.getElementById("homepage").addEventListener("click", getLocation);
document.getElementById("cv").addEventListener("click", clickCV);
document.getElementById("photography").addEventListener("click", clickPhotography);
document.getElementById("portfolio").addEventListener("click", clickPortfolio);
document.getElementById("back").addEventListener("click", clickBack);


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
  dataLayer.push({
	'event':'clickHomepage',
	'category':'homepage',
	'action':'image click',
	'label':x.innerHTML
});
}

		function clickCV() {
		  dataLayer.push({
		  	'event':'clickHomepage',
		  	'category':'homepage',
		  	'action':'cv click',
		  	'label':'user click cv button'
		  });
		};

		function clickPhotography() {
		  dataLayer.push({
		  	'event':'clickHomepage',
		  	'category':'homepage',
		  	'action':'photography click',
		  	'label':'user click photography button'
		  });
		};

		function clickPortfolio() {
		  dataLayer.push({
		  	'event':'clickHomepage',
		  	'category':'homepage',
		  	'action':'portfolio click',
		  	'label':'user click portfolio button'
		  });
		};

		function clickBack() {
		  dataLayer.push({
		  	'event':'clickHomepage',
		  	'category':'homepage',
		  	'action':'back click',
		  	'label':'user click back button'
		  });
		};