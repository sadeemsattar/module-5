$(   //here $ represent jquery function that is equal to document.addlistner("domcontentloaded...")here we cant include this because we r using bootstrap that used jquery ass a result we would need to this in jquery way
    function(){//this function will executed when html has been processed b4 any image or any resources
        //same as document.querySelector("#navbarToggle").addeventListner("blur,...")
        $("#navbarToggle").blur(function(event){//jquery $ sign function also has anither functionality and that is it serves as query selector
            var screenWidth=window.innerWidth;//browser window
            if(screenWidth < 768){
                $("#collapsable-nav").collapse('hide');//collapse is a bootsrap jquery function that Hides a collapsible element when passed "hide" in it
            }
        });

                // In Firefox and Safari, the click event doesn't retain the focus
        // on the clicked button. Therefore, the blur event will not fire on
        // user clicking somewhere else in the page and the blur event handler
        // which is set up above will not be called.
        // Refer to issue #28 in the repo.
        // Solution: force focus on the element that the click event fired on
        $("#navbarToggle").click(function(event){
            $(event.target).focus();
        });
});

(function(global){
    var dc={};
    var homeHtml="snippets/home-snippet.html";
    var allCategoriesUrl="https://davids-restaurant.herokuapp.com/categories.json";
    var categoriesTitleHtml="snippets/categories-title-snippet.html";
    var categoryHtml="snippets/category-snippet.html";
    var menuItemsUrl="https://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemsTitleHtml="snippets/menue-items-title.html";
    var menuItemHtml="snippets/menue-item.html";

    //convinience function for inserting innerhtml for select
    var insertHtml=function(selector,html){
        var targetElem=document.querySelector(selector);
        targetElem.innerHTML=html;
    };


    //showing loading icon inside element identified by "selectr"
    var showLoading =function(selector){
    var html="<div class='text-center'>";
    html+="<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector,html);
    };

    //return substitute of'{{propName}}'
    //with propValue in given 'string'
    var insertProperty=function(string,propName,propValue){//string=category-snippet propname="name"
        var propToReplace="{{"+ propName + "}}";
        string=string.replace(new RegExp(propToReplace,"g"),propValue);
        return string;
    }

    // Remove the class 'active' from home and switch to Menu button
    var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;
  
    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") == -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };

    //on page load before image or css
    document.addEventListener("DOMContentLoaded",function(event){

        
        // var data=JSON.parse(allCategoriesUrl);
        // alert(data[0].name);
        //on first load,show home view
       showLoading("#main-content");
       
        $ajaxUtils.sendGetRequest(homeHtml,
            function(resposeText){
                console.log(resposeText);
                $ajaxUtils.sendGetRequest(allCategoriesUrl,
                    function(category){
                        
                        var rand=Math.floor(Math.random() * category.length);
                        var chosen=category[rand].short_name;

                       

                        $ajaxUtils.sendGetRequest(homeHtml,
                                function(mytext){
                                    mytext=insertProperty(mytext,"randomCategoryShortName",chosen);
                                    homeHtml=mytext;
                                    document.querySelector("#main-content").innerHTML=homeHtml;
                                    //alert(mytext);
                                },false
                            )//AJAX LAST
                     
                    },
                    true
                )//AJAX SECOND
                    
               // document.querySelector("#main-content").innerHTML=resposeText;
            },
            false
        );//sendGetRequest AJAX LAST
        
    });//eventlistner

    //load the menue categories view
    dc.loadMenuCategories=function(){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl,buildAndShowCategoriesHTML)
    };

    // //load the menue items view
    // //'categoryshort' is a short name for a category
    dc.loadMenuItems=function(categoryShort){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort,buildAndShowMenuItemsHTML)
    };

    //builds html for the categories page based on the data from server
    function buildAndShowCategoriesHTML(categories){
        //load title snippet of categories page
        $ajaxUtils.sendGetRequest(categoriesTitleHtml,
                function(categoriesTitleHtml){
                    //Retrieve single category snippet
                        $ajaxUtils.sendGetRequest(categoryHtml,
                            function(categoryHtml){
                                // Switch CSS class active to menu button
                                switchMenuToActive();
                                var categoriesViewHtml=buildCategoriesViewHtml(categories,categoriesTitleHtml,categoryHtml);
                                insertHtml("#main-content",categoriesViewHtml);
                            },
                            false
                        );
                },
                false
            );
    }

    //using categoris data and snippet html
    ///build categories view html to be inserted int page
    function buildCategoriesViewHtml(categories,categoriesTitleHtml,categoryHtml){
        var finalHtml=categoriesTitleHtml;
        finalHtml+= "<section class='row'>";

        //loop over categories
        for(var i=0;i<categories.length;i++){
            //insert category values
            var html=categoryHtml;
            var name=""+categories[i].name;
            var short_name=categories[i].short_name;
            html=insertProperty(html,"name",name);
            html=insertProperty(html,"short_name",short_name);
            finalHtml+=html;

        }

        finalHtml+="</section>";
        return finalHtml;
    }
    //builds html for the single category page based on the data from the server
    function buildAndShowMenuItemsHTML(categoryMenuItems){
   //loadtitle snippet of menu items page
        $ajaxUtils.sendGetRequest(menuItemsTitleHtml,
            
                function(menuItemsTitleHtml){
                    //retrieve single menue item snippet
                    $ajaxUtils.sendGetRequest(menuItemHtml,
                            function(menuItemHtml){
                                // Switch CSS class active to menu button
                                 switchMenuToActive();
                                var menuItemsViewHtml=buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml);
                                insertHtml("#main-content",menuItemsViewHtml);
                            },
                            false
                        );
                },
                false
            );
    }

    //using category and menu items data and snippets html
    //build menu items view html to be inserted into page
    function buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml){
        menuItemsTitleHtml=insertProperty(menuItemsTitleHtml,"name",categoryMenuItems.category.name);
        menuItemsTitleHtml=insertProperty(menuItemsTitleHtml,"special_instructions",categoryMenuItems.category.special_instructions);
        var finalHtml=menuItemsTitleHtml;
        finalHtml+="<section class='row'>";

        //loop over menu items
        var menuItems=categoryMenuItems.menu_items;
        var catShortName=categoryMenuItems.category.short_name;

        for(var i=0;i<menuItems.length;i++){
            var html=menuItemHtml;
            html=insertProperty(html,"short_name",menuItems[i].short_name);
            html=insertProperty(html,"catShortName",catShortName);
            html=insertItemPrice(html,"price_small",menuItems[i].price_small);
            html=insertItemPortionName(html,"small_portion_name",menuItems[i].small_portion_name);
            html=insertItemPrice(html,"price_large",menuItems[i].price_large);
            html=insertItemPortionName(html,"large_portion_name",menuItems[i].large_portion_name);
            html=insertProperty(html,"name",menuItems[i].name);
            html=insertProperty(html,"description",menuItems[i].description);
            
            //add clearfix after every second menue item
            if(i%2 != 0){
                html+="<div class='clearfix visible-lg-block visible-md-block'></div>";
            }
            finalHtml+=html;

        }
        finalHtml+="</section>";
        return finalHtml;
    }

    // Appends price with '$' if price exists
    function insertItemPrice(html,pricePropName,priceValue) {
    // If not specified, replace with empty string
        if (!priceValue) {
            return insertProperty(html, pricePropName, "");;
        }

        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }


    // Appends portion name in parens if it exists
    function insertItemPortionName(html,portionPropName,portionValue) {
    // If not specified, return original string
        if (!portionValue) {
             return insertProperty(html, portionPropName, "");
        }

        portionValue = "(" + portionValue + ")";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

    // function buildrandomcategory(categories,categoriesTitleHtml,categoryHtml){
    //     var finalHtml=categoriesTitleHtml;
    //     finalHtml+= "<section class='row'>";
    //     var rand=Math.floor(Math.random() * categories.length);
    //     //loop over categories
      
    //         //insert category values
    //         var html=categoryHtml;
    //         var name=""+categories[rand].name;
    //         var short_name=categories[rand].short_name;
    //         html=insertProperty(html,"name",name);
    //         html=insertProperty(html,"short_name",short_name);
    //         html=insertProperty(html,"randomCategoryShortName",name);
    //         finalHtml+=html;

    //     finalHtml+="</section>";
    //     return finalHtml;
    // }

    global.$dc=dc;
    
})(window);
