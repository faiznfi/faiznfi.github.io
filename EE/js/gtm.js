if($('#promo').is(':visible')){
    promoView();
};
		

if($('#product1').is(':visible')){
    productView();
};
		function promoView() 
		{
		  dataLayer.push
		  ({
		  	'event':'promoView',
		  	'category':'EE Test',
		  	'action':'Promo View',
		  	'label':'',
		  	'ecommerce': 
		  	{
			    'promoView': 
			    {
			      'promotions': 
			      [{
			         'id': 'PROMOTION1',            // ID or Name is required.
			         'name': 'Testing Promo View',
			         'creative': 'promo1',
			         'position': '1'
			       }]
				}
		  	}
		  })
		};
		function productView() 
		{
		  dataLayer.push
		  ({
		  	'event':'productView',
		  	'category':'EE Test',
		  	'action':'Product View',
		  	'label':'',
		  	'ecommerce': {
		      'click': {
		        'actionField': {'list': 'Testing List'},      // Optional list property.
		        'products': [{
		          'name': 'Testing Produk 1',                      // Name or ID is required.
		          'id': '12345',
		          'price': 30000,
		          'brand': 'Testing Brand',
		          'category': 'Testing Cateogry',
		          'variant': 'Testing Variant',
		          'position': 1
		         }]
		       }
		     }
		  })
		};

document.getElementById("promo").addEventListener("click", promoClick);
		function promoClick() {
		  dataLayer.push({
		  	'event':'promoClick',
		  	'category':'EE Test',
		  	'action':'Promo Click',
		  	'label':'',
		  	'ecommerce': 
		  	{
			    'promoView': 
			    {
			      'promotions': 
			      [{
			         'id': 'PROMOTION1',            // ID or Name is required.
			         'name': 'Testing Promo View',
			         'creative': 'promo1',
			         'position': '1'
			       }]
				}
		  	}
		  })
		};
document.getElementById("product1").addEventListener("click", productClick);
		function productClick() {
		  dataLayer.push({
		  	'event':'productClick',
		  	'category':'EE Test',
		  	'action':'Product Click',
		  	'label':'',
		  	'ecommerce': {
		      'click': {
		        'actionField': {'list': 'Testing List'},      // Optional list property.
		        'products': [{
		          'name': 'Testing Produk 1',                      // Name or ID is required.
		          'id': '12345',
		          'price': 30000,
		          'brand': 'Testing Brand',
		          'category': 'Testing Cateogry',
		          'variant': 'Testing Variant',
		          'position': 1
		         }]
		       }
		     }
		  })
		};
document.getElementById("atc").addEventListener("click", atc);
		function atc() {
		  dataLayer.push({
		  	'event':'atc',
		  	'category':'EE Test',
		  	'action':'atc',
		  	'label':'',
		  	'ecommerce': {
		      'add': {
		        'products': [{
		          'name': 'Testing Produk 1',                      // Name or ID is required.
		          'id': '12345',
		          'price': 30000,
		          'brand': 'Testing Brand',
		          'category': 'Testing Cateogry',
		          'variant': 'Testing Variant',
		          'quantity': 1
		         }]
		       }
		     }
		  })
		};
document.getElementById("checkout1").addEventListener("click", checkout);
		function checkout() {
		  dataLayer.push({
		  	'event':'checkout',
		  	'category':'EE Test',
		  	'action':'checkout 1',
		  	'label':'',
		  	'ecommerce': {
		      'checkout': {
        		'actionField': {'step': 1, 'option': 'click checkout in cart'},      // Optional list property.
		        'products': [{
		          'name': 'Testing Produk 1',                      // Name or ID is required.
		          'id': '12345',
		          'price': 30000,
		          'brand': 'Testing Brand',
		          'category': 'Testing Cateogry',
		          'variant': 'Testing Variant',
		          'quantity': 1
		         }]
		       }
		     }
		  })
		};

document.getElementById("checkout2").addEventListener("click", checkout2);
		function checkout2() {
		  dataLayer.push({
		  	'event':'checkout',
		  	'category':'EE Test',
		  	'action':'checkout 2',
		  	'label':'',
		  	'ecommerce': {
		      'checkout': {
        		'actionField': {'step': 2, 'option': 'pilih pengiriman'},      // Optional list property.
		        'products': [{
		          'name': 'Testing Produk 1',                      // Name or ID is required.
		          'id': '12345',
		          'price': 30000,
		          'brand': 'Testing Brand',
		          'category': 'Testing Cateogry',
		          'variant': 'Testing Variant',
		          'quantity': 1
		         }]
		       }
		     }
		  })
		};

document.getElementById("checkout3").addEventListener("click", checkout3);
		function checkout3() {
		  dataLayer.push({
		  	'event':'checkout',
		  	'category':'EE Test',
		  	'action':'checkout 3',
		  	'label':'',
		  	'ecommerce': {
		      'checkout': {
        		'actionField': {'step': 3, 'option': 'pilih durasi'},      // Optional list property.
		        'products': [{
		          'name': 'Testing Produk 1',                      // Name or ID is required.
		          'id': '12345',
		          'price': 30000,
		          'brand': 'Testing Brand',
		          'category': 'Testing Cateogry',
		          'variant': 'Testing Variant',
		          'quantity': 1
		         }]
		       }
		     }
		  })
		};

document.getElementById("purchase").addEventListener("click", purchase);
		function purchase() {
		  dataLayer.push({
		  	'event':'purchase',
		  	'category':'EE Test',
		  	'action':'order complete',
		  	'label':'',
		  	'ecommerce': {
			    'purchase': {
			      'actionField': {
			        'id': 'T12345',                         // Transaction ID. Required for purchases and refunds.
			        'affiliation': 'Online Store',
			        'revenue': '31000',                     // Total transaction value (incl. tax and shipping)
			        'tax':'1000',
			        'shipping': '9000',
			        'coupon': 'SUMMER_SALE'
			      },
			      'products': [{                            // List of productFieldObjects.
			          'name': 'Testing Produk 1',                      // Name or ID is required.
			          'id': '12345',
			          'price': 30000,
			          'brand': 'Testing Brand',
			          'category': 'Testing Cateogry',
			          'variant': 'Testing Variant',
			          'quantity': 1,
			          'coupon': 'SUMMER_SALE'                            // Optional fields may be omitted or set to empty string.
			       }]
			    }
			  }

		  })
		};