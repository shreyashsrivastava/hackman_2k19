const ENV_HOST = "http://localhost:3000"

$.get(ENV_HOST+'/api/home/get_latest', function (data, status) {
	console.log(data)

	})
$(document).ready(function(){
	sessionStorage.removeItem("auth_session");
    $('.modal').modal();
    $('#login_btn').click(function () {
    	if(! sessionStorage.getItem("auth_session")){
    		$('#authpage').modal('open')
    	}
    	else{
    		window.location.replace(ENV_HOST+'/dashboard');
    	}
    })
    $('#login_btn_').click(function () {
    	var uname = $('#auth_user_name').val()
    	var pass = $('#auth_pass_name').val()
    	if(uname != '' && pass !=''){
    		$.ajax({
          url: ENV_HOST+'/api/auth/login',
          type: "POST",
          data: JSON.stringify({U_name: uname, U_pass:pass }),
          dataType : 'json',
          contentType: 'application/json',
          success: function(result) {
 	     if(result.data == null) {Materialize.toast(result.err, 4000);console.log(result)}
 	     else{
 	     	sessionStorage.setItem('auth_session',JSON.stringify(result.data))
 	     	window.location.replace(ENV_HOST+'/dashboard');
 	     }
          }
});      
    	}
    })
  });
        