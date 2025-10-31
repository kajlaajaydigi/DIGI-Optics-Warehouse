// *************************************************************************************************************
// Login system code
// google.script.run.withSuccessHandler(geturl).withFailureHandler(geturl).getUrl();

var department;

// Run by body onload on html page

// google.script.url.getLocation(function(location) {
//   let menuMapping = {
//     "index": "?v=index",
//     "newjobcard": "?v=newjobcard",
//     "searchjc": "?v=searchjc",
//     "jobcardlist": "?v=jobcardlist",
//     "dailytasklist": "?v=dailytasklist",
//     "addexpense": "?v=addexpense",
//     "addsales": "?v=addsales",
//     "adddailytask": "?v=adddailytask",
//     "addusers": "?v=addusers",
//     "report": "?v=report",
//     "expensereport": "?v=expensereport",
//     "dailytaskreport": "?v=dailytaskreport",
//     "inventory": "?v=inventory",
//     "promotions": "?v=promotions",
//     "help": "?v=help",
//     "addvendor": "?v=addvendor",
//   };

//   let currentPage = location.parameters.v;

//   if (menuMapping[currentPage]) {
//     let activeMenu = document.getElementById(menuMapping[currentPage]);
//     if (activeMenu) {
//       activeMenu.classList.add("active");

//       // 🔹 Check if this menu item is inside a dropdown
//       let parentMenu = activeMenu.closest(".nav-item");
//       if (parentMenu) {
//         parentMenu.classList.add("active"); // Activate parent menu
//         let collapseElement = parentMenu.querySelector(".collapse");
//         if (collapseElement) {
//           collapseElement.classList.add("show"); // Keep dropdown open
//         }
//       }
//     }
//   }
// });

function testSession(){
  if(sessionStorage.getItem("empname") == "null" || sessionStorage.getItem("empname") == null)
  {
    // window.open(loc, '_top');
    var temploc = loc+"?v=login";
    window.open(temploc, '_top');
  }
  else if(sessionStorage.getItem("empname") != "null" || sessionStorage.getItem("empname") != null)
  {
    var temploc = loc+"?v=index";
    window.open(temploc, '_top');
    getDepartment();
  }

  var useraccess = document.getElementById("useraccessname");
  useraccess.innerHTML = sessionStorage.getItem("name");
}

function loginsystem()
{
  var empname;
  var empcode;
  // document.getElementById('loginstatus').innerText = "";
  empname = $('#empname').val();
  empcode = $('#empcode').val();
  $("#spinner").removeClass("hide");
  $("#loginalert").addClass("hide");

  google.script.run.withSuccessHandler(loginsuccess).withFailureHandler(loginsuccess).getEmpCode(empname,empcode);
}

var loc ='';
function geturl(url)
{
  if(url != "" && url != undefined && url != null)
  {
    loc = url;
  }
  else
  {
    Swal.fire({
      title: "URL Not Found",
      text: "Your browser URL is not found",
      icon: "error"
    });

  }
}

function urldeliver(link)
{
  console.log("Created URL "+loc);
  var temp = loc+link;
  window.open(temp, '_top');
}


var expirytime;

function loginsuccess(status)
{
  if(status[10] == "true")
  {
    department = status[6];
    sessionStorage.setItem("department", department);
    Swal.fire({
      title: "Welcome, " + status[2],
      text: "Your activity will be recorded from this point",
      icon: "success"
    }).then(function()
        {
          // console.log("URL: "+loc+"?v=newtask");
          var temploc = loc+"?v=index";
          window.open(temploc, '_top');
        }
      );
    sessionStorage.setItem("empuid", status[0]);
    sessionStorage.setItem("name", status[2]);
    sessionStorage.setItem("empdept", status[6]);
    sessionStorage.setItem("empname", status[7]);
    sessionStorage.setItem("empcode", status[8]);
    sessionStorage.setItem("expiry", status[9]);
    $("div.login-spanner").removeClass("show");
    $("div.login-overlay").removeClass("show");
    $("#spinner").addClass("hide");

    google.script.run.setLoginActivity(status[7]);
    // getDepartment();
  }
  else
  {
    $("#loginalert").removeClass("hide");
    $("#spinner").addClass("hide");
  }
}

function logout()
{
  google.script.run.setLogoutActivity(sessionStorage.getItem("empname"));
  sessionStorage.setItem("empname", null);
  sessionStorage.setItem("empcode", null);
  sessionStorage.setItem("expiry", null);
  sessionStorage.setItem("department", null);
  window.open(loc, '_top');
}

function getDepartment()
{
  var printmenu;
  if(sessionStorage.getItem("department") == "Admin")
  {
    $(".newjobcard").removeClass("hide");
    $(".searchjc").removeClass("hide");
    $(".jobcardlist").removeClass("hide");
    $(".addexpense").removeClass("hide");
    $(".addsales").removeClass("hide");
    $(".addusers").removeClass("hide");

    // group tasks
    $(".tasks-group").removeClass("hide");
    $(".dailytasklist").removeClass("hide");
    $(".adddailytask").removeClass("hide");

    // group customers
    $(".customers-group").removeClass("hide");
    $(".newcustomer").removeClass("hide");
    $(".customerlist").removeClass("hide");

    // group prescription
    $(".prescription-group").removeClass("hide");
    $(".prescription").removeClass("hide");
    $(".prescriptionlist").removeClass("hide");

    // group vendors
    $(".vendors-group").removeClass("hide");
    $(".addvendor").removeClass("hide");
    $(".vendorlist").removeClass("hide");

    // group report
    $(".reports-group").removeClass("hide");
    $(".report").removeClass("hide");
    $(".expensereport").removeClass("hide");
    $(".dailytaskreport").removeClass("hide");

    $(".inventory").removeClass("hide");
    $(".promotions").removeClass("hide");
    $(".help").removeClass("hide");
  }
  else if(sessionStorage.getItem("department") == "Doer")
  {
    $(".newjobcard").removeClass("hide");
    $(".searchjc").removeClass("hide");
    $(".jobcardlist").removeClass("hide");
    $(".addexpense").removeClass("hide");
    $(".addsales").removeClass("hide");
    $(".addusers").addClass("hide");

    // group tasks
    $(".tasks-group").removeClass("hide");
    $(".dailytasklist").removeClass("hide");
    $(".adddailytask").addClass("hide");

    // group customers
    $(".customers-group").removeClass("hide");
    $(".newcustomer").removeClass("hide");
    $(".customerlist").removeClass("hide");

    // group prescription
    $(".prescription-group").removeClass("hide");
    $(".prescription").removeClass("hide");
    $(".prescriptionlist").removeClass("hide");

    // group report
    $(".reports-group").addClass("hide");
    $(".report").addClass("hide");
    $(".expensereport").addClass("hide");
    $(".dailytaskreport").addClass("hide");

    $(".inventory").addClass("hide");
    $(".promotions").addClass("hide");
    $(".help").addClass("hide");
  }
  else
  {
    console.log("Menu not available");
  }
}

var expiryauto;
function loginTester(expiry){
  expiryauto = "";

  if(expiry != undefined)
  {
    expiryauto = expiry;
    for(var i = 0; i < expiry.length; i++)
    {
      if(sessionStorage.getItem("empname") == expiry[i][5] && sessionStorage.getItem("empcode") == expiry[i][6])
      {
        expirytime = expiry[i][7];
      }
    }
  }
  if(expirytime != undefined)
  {
    expirytime = new Date(expirytime);
    // console.log("LoginTester expirytime: "+expirytime);
    var cdate = new Date();
    // console.log("LoginTester Cdate: "+cdate);
    if( expirytime.getTime() > cdate.getTime())
    {
      // console.log("LoginTester - Expirytime bigger than new date"+ expirytime);
      // getLocation();
    }
    else
    {
      if(sessionStorage.getItem("empname") != "null")
      {
      // console.log("LoginTester - Expirytime smaller than new date"+ expirytime);
      logout();
      }
    }
  }
}

!function loginTesterauto(expiryauto){
  if(expiryauto != undefined && expiryauto != "")
  {
    for(var i = 0; i < expiryauto.length; i++)
    {
      if(sessionStorage.getItem("empname") == expiryauto[i][5] && sessionStorage.getItem("empcode") == expiryauto[i][6])
      {
        expirytime = expiryauto[i][7];
      }
    }
  }
  if(expirytime != undefined)
  {
    expirytime = new Date(expirytime);
    console.log("LoginTesterAuto expirytime: "+expirytime);
    var cdate = new Date();
    console.log("LoginTesterAuto Cdate: "+cdate);
    if(expirytime.getTime() > cdate.getTime())
    {
      // getLocation();
      // console.log("LoginTesterAuto - Expirytime bigger than new date"+ expirytime);
    }
    else
    {
      if(sessionStorage.getItem("empname") != "null")
      {
      // console.log("LoginTesterAuto - Expirytime smaller than new date"+ expirytime);
      logout();
      }
    }
  }
  setTimeout(loginTester, 60000);
}();

// !function expiryTrigger(){
//   google.script.run.withSuccessHandler(loginTester).withFailureHandler(loginTester).getExpiry();
//   setTimeout(expiryTrigger, 60000);
// }();

// Login system code END
// *************************************************************************************************************

function getSetting()
{
  google.script.run.withSuccessHandler(setSettingData).withFailureHandler(setSettingData).getSetting();
}

function setSettingData(arr)
{
  if(arr != null && arr != "")
  {
    document.getElementById("brandlogo").src = arr[0][0];
    document.getElementById("brandlogo").alt = arr[0][1];
  }
  else
  {
    Swal.fire({
      title: "Options Not Found",
      text: "Project, Doers, and Frequency options are not found",
      icon: "error"
    });

  }
}

function getLoginLogo()
{
  google.script.run.withSuccessHandler(setLoginLogo).withFailureHandler(setLoginLogo).getLoginLogo();
}

function setLoginLogo(arr)
{
  if(arr != null && arr != "")
  {
    document.getElementById("loginlogo").src = arr;
  }
}

(function() {
  "use strict"; // Start of use strict

  var sidebar = document.querySelector('.sidebar');
  var sidebarToggles = document.querySelectorAll('#sidebarToggle, #sidebarToggleTop');
  var sidebarcol = document.querySelector('#sidebar-col');

  if (sidebar) {

    var collapseEl = sidebar.querySelector('.collapse');
    var collapseElementList = [].slice.call(document.querySelectorAll('.sidebar .collapse'))
    var sidebarCollapseList = collapseElementList.map(function (collapseEl) {
      return new bootstrap.Collapse(collapseEl, { toggle: false });
    });

    for (var toggle of sidebarToggles) {
      // Toggle the side navigation
      toggle.addEventListener('click', function(e) {
        document.body.classList.toggle('sidebar-toggled');
        sidebar.classList.toggle('toggled');
        sidebarcol.classList.toggle('hide');

        if (sidebar.classList.contains('toggled')) {
          for (var bsCollapse of sidebarCollapseList) {
            bsCollapse.hide();
          }
        };
      });
    }

    // Close any open menu accordions when window is resized below 768px
    window.addEventListener('resize', function() {
      var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

      if (vw < 768) {
        for (var bsCollapse of sidebarCollapseList) {
          bsCollapse.hide();
        }
      };
    });
  }

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over

  var fixedNaigation = document.querySelector('body.fixed-nav .sidebar');

  if (fixedNaigation) {
    fixedNaigation.on('mousewheel DOMMouseScroll wheel', function(e) {
      var vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

      if (vw > 768) {
        var e0 = e.originalEvent,
          delta = e0.wheelDelta || -e0.detail;
        this.scrollTop += (delta < 0 ? 1 : -1) * 30;
        e.preventDefault();
      }
    });
  }

  var scrollToTop = document.querySelector('.scroll-to-top');

  if (scrollToTop) {

    // Scroll to top button appear
    window.addEventListener('scroll', function() {
      var scrollDistance = window.pageYOffset;

      //check if user is scrolling up
      if (scrollDistance > 100) {
        scrollToTop.style.display = 'block';
      } else {
        scrollToTop.style.display = 'none';
      }
    });
  }

})(); // End of use strict


function toggleHideClass() {
    const element = document.getElementById('sidebar-col');
    const sidebarnav = document.getElementById('sidebarnav');

    // Check if the viewport width is less than or equal to 600px
    if (window.innerWidth <= 600) {
        element.classList.add('hide');
        sidebarnav.classList.add('toggled');
    } else {
        element.classList.remove('hide');
        sidebarnav.classList.remove('toggled');
    }
}

// Call the function once on initial load
window.addEventListener('DOMContentLoaded', toggleHideClass);

document.getElementById("sidebarToggleTop").addEventListener("click", function() {
    let contentCol = document.getElementById("contentColumn");

    if (contentCol.classList.contains("col-md-10")) {
        contentCol.classList.remove("col-md-10");
        contentCol.classList.add("col-md-12");
    } else {
        contentCol.classList.remove("col-md-12");
        contentCol.classList.add("col-md-10");
    }
});

// Toggle overlay
function toggleOverlay(show = true) {
  document.querySelectorAll('div.overlay').forEach(el => {
      el.classList.toggle('show', show);
      el.classList.toggle('hide', !show);
  });
}


toastr.options = {
  "positionClass": "toast-bottom-right",
  // Other optional settings:
  "closeButton": true,
  "progressBar": true,
  "timeOut": "3000",
  "extendedTimeOut": "1000"
};
