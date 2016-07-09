//Fonction pour générer une couleur random
function randomColor()
{
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (i=0;i<6;i++)
	{
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
//Fonction pour envoyer un message dans la console
function sendCmd(cidSend, msg)
{
	console.log('['+cidSend+'] : '+msg);
}
//Fonction pour générer un UUID
function uuid()
{
	function s4()
	{
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
//Fonction pour générer un chiffre random
function randomNumber(min, max)
{
	return Math.random() * (max - min) + min;
}
//Fonction pour set la première lettre d'une chaine en MAJ
function setCapFirst(text)
{
	return text.substr(0,1).toUpperCase()+text.substr(1,text.length).toLowerCase();
}
//Fonction pour générer un point random
function generateRandomPoint()
{
	if(Object.keys(points).length < 200)
	{
		var ruuid = uuid();
		var mapY = 0;
		var mapYMax = 1080;
		var mapX = 0;
		var mapXMax = 1920;
		var randomPosY = 0;
		var randomPosX = 0;
		var newPointPosBloque = false;
		var randomRadius =  randomNumber(5, 20);
		randomPosY = randomNumber(mapY, mapYMax);
		randomPosX = randomNumber(mapX, mapXMax);
		for(var key in points)
		{
			//Pos Y
			var testPosY = (randomPosY + randomRadius);
			var testPosY2 = points[key]['posY'];
			var testPosY3 = (points[key]['posY'] + (points[key]['radius'] * 2));
			//Pos X
			var testPosX = (randomPosX + randomRadius);
			var testPosX2 = points[key]['posX'];
			var testPosX3 = (points[key]['posX'] + (points[key]['radius'] * 2));
			//Test
			if((testPosY + randomRadius) > testPosY2 && randomPosY < testPosY3 && (testPosX + randomRadius) > testPosX2 && randomPosX < testPosX3)
			{
				newPointPosBloque = true;
			}
		}
		if(newPointPosBloque == false)
		{
			points[ruuid] = {
				'radius' : randomRadius,
				'backgroundColor' : randomColor()
			};
			points[ruuid]['posY'] = randomPosY;
			points[ruuid]['posX'] = randomPosX;
		}
	}
}
//Variable contenant les points de la maps
points = {};
//On génére des points random
generateRandomPoint();
setInterval(generateRandomPoint, 1);
//On envoi en continu les points
setInterval(function (){
	io.emit('points', points);
}, 100);
//Chargement des bibliothèques
var http = require('http');
var fs = require('fs');
//Chargement du fichier index.htm
var serveur = http.createServer(function (requete, reponse){
	fs.readFile('index.htm', 'utf-8', function (erreur, contenu){
		//Header
		reponse.writeHead(200, {
			"Content-Type" : "text/html"
		});
		//On envoi la page
		reponse.end(contenu);
	});
});
//Chargmeent socket.io
var io = require('socket.io').listen(serveur);
//Quand un client se connect
io.sockets.on('connection', function (socket){
	//Variable d'avancement
	socket.avRight = false;
	socket.avLeft = false;
	socket.avDown = false;
	socket.avUp = false;
	//Variable pour définir le nombre de pixel à ajouter pour avancer
	var pixelMove = 2;
	//Get adresse ip
	var ip = socket.handshake.address;
	//Variable pour définir le sender dans la conseole
	var cidSend = ip;
	//On log la connexion du player
	sendCmd(cidSend, 'Je viens de charger la page.');
	//On varti d'une nouvelle connexion
	socket.broadcast.emit('new_connect', true);
	//Fonctions pour save ou recuperer les infos du user
	function gdp(mode, id, data)
	{
		var dataPlayer = {
			'ip' : ip
		};
		if(socket.dataPlayer == undefined)
		{
			socket.dataPlayer = {
				'ip' : ip
			};
		}
		else
		{
			dataPlayer = socket.dataPlayer;
		}
		switch(mode)
		{
			case "get":
				dataPlayer = socket.dataPlayer[id];
			break;
			case "set":
				dataPlayer[id] = data;
				socket.dataPlayer[id] = data;
			break;
		}
		return dataPlayer;
	}
	//Fonction pour envoyer une erreur
	function sendError(errorId, msg)
	{
		socket.emit('errorPlayer', {
			'errorId' : errorId,
			'msg' : msg
		});
	}
	//On écoute les données de connexion
	socket.on('connectPlayer', function (data){
		//On verifie le pseudo
		var username = data['username'].trim().toLowerCase();
		if(username !== "")
		{
			if(username.length >= 5)
			{
				if(username.length <= 20)
				{
					var password = data['password'];
					if(password !== "")
					{
						var heightCanvas = data['heightCanvas'];
						var widthCanvas = data['widthCanvas'];
						var puuid = uuid();
						var colorUsername = randomColor();
						var colorBackround = randomColor();
						var colorBorder = randomColor();
						var randomBorder = randomNumber(5, 10);
						var randomPoint = 60;
						var raduis = 40;
						username = setCapFirst(username);
						gdp('set', 'uuid', puuid);
						gdp('set', 'username', username);
						gdp('set', 'password', password);
						gdp('set', 'points', randomPoint);
						gdp('set', 'is_connect', true);
						gdp('set', 'heightCanvas', heightCanvas);
						gdp('set', 'widthCanvas', widthCanvas);
						gdp('set', 'posX', widthCanvas / 2);
						gdp('set', 'posY', heightCanvas / 2);
						gdp('set', 'radius', raduis);
						gdp('set', 'borderWidth', randomBorder);
						gdp('set', 'colorUsername', colorUsername);
						gdp('set', 'colorBackround', colorBackround);
						gdp('set', 'colorBorder', colorBorder);
						socket.emit('is_connect', {
							'connected' : true,
							'msg' : 'Vous êtes bien connecté.'
						});
						io.emit('playerConnectInfos', {
							'uuid' : puuid,
							'data' : {
								'username' : username,
								'points' : randomPoint,
								'posX' : widthCanvas / 2,
								'posY' : heightCanvas / 2,
								'radius' : raduis,
								'colorUsername' : colorUsername,
								'colorBackround' : colorBackround,
								'colorBorder' : colorBorder,
								'borderWidth' : randomBorder
							}
						});
						sendCmd(username, 'Je viens de me connecter !');
					}
					else
					{
						sendError('connect_password_notfound', 'Veuillez entrer un mot de passe.');
					}
				}
				else
				{
					sendError('connect_username_big', 'Votre pseudo doit faire maximum 20 caractère.');
				}
			}
			else
			{
				sendError('connect_username_small', 'Votre pseudo doit faire minimum 5 caractère.');
			}
		}
		else
		{
			sendError('connect_username_notfound', 'Veuillez entrer un pseudo.');
		}
	});
	//On envoi ses infos de connexion à tous les clients qui se connect
	socket.on('new_connect', function (data){
		if(data == true && gdp('get', 'is_connect') == true)
		{
			var dataPlayer = socket.dataPlayer;
			io.emit('playerConnectInfos', {
				'uuid' : dataPlayer['uuid'],
				'data' : {
					'username' : dataPlayer['username'],
					'points' : dataPlayer['points'],
					'posX' : dataPlayer['posX'],
					'posY' : dataPlayer['posY'],
					'radius' : dataPlayer['radius'],
					'colorUsername' : dataPlayer['colorUsername'],
					'colorBackround' : dataPlayer['colorBackround'],
					'colorBorder' : dataPlayer['colorBorder'],
					'borderWidth' : dataPlayer['borderWidth']
				}
			});
		}
	});
	//On ecoute les données d'avancement
	socket.on('playerMoove', function (data){
		if(gdp('get', 'is_connect') == true)
		{
			if(data['top'] == true)
			{
				socket.avUp = true;
			}
			else
			{
				socket.avUp = false;
			}
			if(data['bottom'] == true)
			{
				socket.avDown = true;
			}
			else
			{
				socket.avDown = false;
			}
			if(data['left'] == true)
			{
				socket.avLeft = true;
			}
			else
			{
				socket.avLeft = false;
			}
			if(data['right'] == true)
			{
				socket.avRight = true;
			}
			else
			{
				socket.avRight = false;
			}
		}
	});
	//On bouge le player
	setInterval(function (){
		if(gdp('get', 'is_connect') == true)
		{
			//On change les pos
			socket.updatePos = false;
			if(socket.avUp == true)
			{
				var posY = gdp('get', 'posY');
				var newPosY = posY - pixelMove;
				var posTest = newPosY - (gdp('get', 'radius') + (gdp('get', 'borderWidth') / 2));
				if(posTest >= 0)
				{
					gdp('set', 'posY', newPosY);
					socket.updatePos = true;
				}
			}
			if(socket.avDown == true)
			{
				var posY = gdp('get', 'posY');
				var newPosY = posY + pixelMove;
				var posTest = newPosY + (gdp('get', 'radius') + (gdp('get', 'borderWidth') / 2));
				if(posTest <= gdp('get', 'heightCanvas'))
				{
					gdp('set', 'posY', newPosY);
					socket.updatePos = true;
				}
			}
			if(socket.avLeft == true)
			{
				var posX = gdp('get', 'posX');
				var newPosX = posX - pixelMove;
				var posTest = newPosX - (gdp('get', 'radius') + (gdp('get', 'borderWidth') / 2));
				if(posTest >= 0)
				{
					gdp('set', 'posX', newPosX);
					socket.updatePos = true;
				}
			}
			if(socket.avRight == true)
			{
				var posX = gdp('get', 'posX');
				var newPosX = posX + pixelMove;
				var posTest = newPosX + (gdp('get', 'radius') + (gdp('get', 'borderWidth') / 2));
				if(posTest <= gdp('get', 'widthCanvas'))
				{
					gdp('set', 'posX', newPosX);
					socket.updatePos = true;
				}
			}
			//On verifie que le player est pas en dehore du canvas
			var posX = gdp('get', 'posX');
			if(posX + (gdp('get', 'radius') / 2) > gdp('get', 'widthCanvas'))
			{
				var newPosX = gdp('get', 'widthCanvas') / 2;
				gdp('set', 'posX', newPosX);
				socket.updatePos = true;
			}
			var posY = gdp('get', 'posY');
			if(posY + (gdp('get', 'radius') / 2) > gdp('get', 'heightCanvas'))
			{
				var newPosY = gdp('get', 'heightCanvas') / 2;
				gdp('set', 'posY', newPosY);
				socket.updatePos = true;
			}
			//On test si le player est sur un point
			for(var key in points)
			{
				var posY = gdp('get', 'posY');
				var posX = gdp('get', 'posX');
				//Pos Y
				var testPosY = (posY + (gdp('get', 'radius') + (gdp('get', 'borderWidth') / 2)));
				var testPosY2 = points[key]['posY'];
				var testPosY3 = (points[key]['posY'] + (points[key]['radius'] * 2));
				//Pos X
				var testPosX = (posX + (gdp('get', 'radius') + (gdp('get', 'borderWidth') / 2)));
				var testPosX2 = points[key]['posX'];
				var testPosX3 = (points[key]['posX'] + (points[key]['radius'] * 2));
				//Test
				if(testPosY > testPosY2 && (posY - gdp('get', 'radius')) < testPosY3 && testPosX > testPosX2 && (posX - gdp('get', 'radius')) < testPosX3)
				{
					//Les points
					var pointsGet = Math.round(gdp('get', 'points') + (points[key]['radius'] / 2));
					gdp('set', 'points', pointsGet);
					//Le radius
					var radiusGet = gdp('get', 'radius') + (points[key]['radius'] / 80);
					if(radiusGet > 100)
					{
						radiusGet = gdp('get', 'radius') + (points[key]['radius'] / 600);
					}
					if(radiusGet <= 200)
					{
						gdp('set', 'radius', radiusGet);
					}
					//On delete
					delete points[key];
					//On envoi l'update
					socket.updatePos = true;
				}
			}
			//S'il y'a une update
			if(socket.updatePos == true)
			{
				//On envoi les updates au clients
				var dataPlayer = socket.dataPlayer;
				io.emit('playerConnectInfos', {
					'uuid' : dataPlayer['uuid'],
					'data' : {
						'username' : dataPlayer['username'],
						'points' : dataPlayer['points'],
						'posX' : dataPlayer['posX'],
						'posY' : dataPlayer['posY'],
						'radius' : dataPlayer['radius'],
						'colorBackround' : dataPlayer['colorBackround'],
						'colorUsername' : dataPlayer['colorUsername'],
						'colorBorder' : dataPlayer['colorBorder'],
						'borderWidth' : dataPlayer['borderWidth']
					}
				});
			}
		}
		else
		{
			socket.emit('disconected', true);
		}
	}, 10);
	//On save les infos utiles du client
	socket.on('playerInfos', function (data){
		var heightCanvas = data['heightCanvas'];
		var widthCanvas = data['widthCanvas'];
		gdp('set', 'heightCanvas', heightCanvas);
		gdp('set', 'widthCanvas', widthCanvas);
	});
	//Quand le client quit le jeu
	socket.on('disconnect', function (){
		socket.dataPlayer = undefined;
		sendCmd(gdp('get', 'ip'), 'Je viens de quitter la page !');
		if(gdp('get', 'is_connect') == true)
		{
			io.emit('deletePlayer', gdp('get', 'uuid'));
		}
	});
});
//On démarre le serveur
serveur.listen(8080);
//On log
sendCmd('Serveur', 'Serveur démarré.');