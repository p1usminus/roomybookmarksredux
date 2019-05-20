var roomybookmarkstoolbarColor = {
	branch: null,
	onLoad: function() {
		document.getElementById("colorText").value = document.getElementById("colorTextButton").color;
		document.getElementById("colorBac").value = document.getElementById("colorBacButton").color;


		document.getElementById("title").value = window.arguments[0].inn.title;
		document.getElementById("url").value = window.arguments[0].inn.url

		var rbtdatas = {id:window.arguments[0].inn.id,}
		this.db(rbtdatas, 'getGata',  function (data) {
			if(data[0]) {document.getElementById("colorText").value = data[0];}
			if(data[0]) {document.getElementById("colorTextButton").color = data[0];}
			if(data[1]) {document.getElementById("colorBac").value = data[1];}
			if(data[1]) {document.getElementById("colorBacButton").color = data[1];}
		});

	},

	colorChanged: function(event, object) {
		if(event.target.value) {
			if(object == 'text') {
				document.getElementById("colorTextButton").color = event.target.value;
				if(event.target.value == '') {
					document.getElementById("colorText").value = '#000000'
					document.getElementById("colorTextButton").color = '#000000'
				}
			}
			if(object == 'background') {document.getElementById("colorBacButton").color = event.target.value;}
				if(validateColor(event.target.value) == false) {
					alert('Please enter a valid HEX color')
					if(object == 'text') {document.getElementById("colorText").value = '#000000'}
					if(object == 'background') {document.getElementById("colorBac").value = ''}
							document.getElementById("colorTextButton").color = document.getElementById("colorText").value;
							document.getElementById("colorBacButton").color = document.getElementById("colorBac").value;

				}
		}
		function validateColor(colorStr) {
			return colorStr.match(/^#[a-f0-9]{6}$/i) !== null;
		}
		if(event.target.color) {
			if(object == 'text') {document.getElementById("colorText").value = event.target.color;}
			if(object == 'background') {document.getElementById("colorBac").value = event.target.color;}
		}

	},

	onOk: function() {
		var rbtdata = {id:window.arguments[0].inn.id, textcolor:document.getElementById("colorText").value, backgroundcolor:document.getElementById("colorBac").value};
		this.db(rbtdata, 'saveData',  function () {window.close();});
	},

	deleteDB: function() {
		if (confirm('Do you wank delete all change?')) {
			this.db('', 'deleteDB');
		}
	},

	db: function(data, DBevent, callback) {
		var thisPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
		Components.utils.import("resource://gre/modules/Services.jsm");
		Components.utils.import("resource://gre/modules/FileUtils.jsm");

		let file = FileUtils.getFile("ProfD", ["roomybookmarkstoolbar.sqlite"]);
		let dbConn = Services.storage.openDatabase(file);
		thisPrefs.getBranch('extensions.roomybookmarkstoolbar.').setBoolPref('DBcreated', true);
		dbConn.executeSimpleSQL("create table if not exists colors (id INTEGER NOT NULL PRIMARY KEY, textcolor TEXT, backgroundcolor TEXT)");

		if (DBevent == 'saveData') {
			var list = new Array();
				var statement = dbConn.createStatement("SELECT * FROM colors");
				statement.executeAsync({
					handleResult: function(aResultSet) {
								for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
								if (row.getResultByName("id") == data.id) {
									list.push(row.getResultByName("id"))
								}
							}
					},
					handleCompletion: function(aReason) {
						if (list[0]) {
							var statement = dbConn.createStatement("UPDATE colors set textcolor = :textcolor, backgroundcolor = :backgroundcolor where id = :id");
							statement.params.id = data.id;
							statement.params.textcolor = data.textcolor;
							statement.params.backgroundcolor = data.backgroundcolor;
							statement.executeAsync({
								handleCompletion: function(aReason) {
									callback();
								}   
							});
						} else {
							var statement = dbConn.createStatement("INSERT INTO colors VALUES(:id, :textcolor, :backgroundcolor)");
							statement.params.id = data.id;
							statement.params.textcolor = data.textcolor;
							statement.params.backgroundcolor = data.backgroundcolor;
							statement.executeAsync({
								handleCompletion: function(aReason) {
									callback();
								}   
							});
						}
						dbConn.asyncClose();
					}   
				});
		}

		if (DBevent == 'getGata') {
			var list = new Array();
			var statement = dbConn.createStatement("SELECT * FROM colors");
			statement.executeAsync({
				handleResult: function(aResultSet) {
					var newHistoryString = "";
						for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
							if (row.getResultByName("id") == data.id) {
								list.push(row.getResultByName("textcolor"))
								list.push(row.getResultByName("backgroundcolor"))
								callback(list)
							}
						}
				},
				handleCompletion: function(aReason) {
					dbConn.asyncClose();
				}   
			});
		}
		if (DBevent == 'deleteDB') {	
				Components.utils.import("resource://gre/modules/FileUtils.jsm");
				var thisPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
				thisPrefs.getBranch('extensions.roomybookmarkstoolbar.').setBoolPref('DBcreated', false);

				var statement = dbConn.createStatement("DELETE FROM colors");
				statement.executeAsync({
					handleCompletion: function(aReason) {
						alert('Please restart your browser to reset styles');
						dbConn.asyncClose();
						window.close();
					}}
				);

			}
	},
};