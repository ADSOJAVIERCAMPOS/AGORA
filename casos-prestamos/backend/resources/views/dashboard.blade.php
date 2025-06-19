<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Coordinación ADSO</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar Styles */
        .sidebar {
            width: 250px;
            background-color: #2e7d32; /* Verde oscuro del diseño */
            color: white;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between; /* Para empujar el cerrar sesión y el usuario abajo */
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }
        .sidebar-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .sidebar-header .logo {
            width: 50px; /* Tamaño del logo */
            height: 50px;
            background-color: white; /* Simula el fondo blanco del logo */
            border-radius: 50%; /* Si es un círculo */
            margin: 0 auto 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            font-weight: bold;
            color: #2e7d32;
            line-height: 1; /* Ajusta la altura de línea */
        }
        .sidebar-header .app-name {
            font-size: 1.5em;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .sidebar-header .tagline {
            font-size: 0.9em;
            opacity: 0.8;
        }

        .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .sidebar-nav li {
            margin-bottom: 10px;
        }
        .sidebar-nav a {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }
        .sidebar-nav a.active,
        .sidebar-nav a:hover {
            background-color: #388e3c; /* Un verde un poco más claro para hover/activo */
        }
        .sidebar-nav a i { /* Iconos */
            margin-right: 10px;
            font-size: 1.2em;
        }

        .sidebar-bottom {
            margin-top: auto; /* Empuja este contenido hacia abajo */
        }
        .sidebar-bottom .user-profile {
            display: flex;
            align-items: center;
            padding-top: 20px; /* Espacio antes del perfil de usuario */
            border-top: 1px solid rgba(255,255,255,0.1); /* Separador */
        }
        .sidebar-bottom .user-avatar {
            width: 40px;
            height: 40px;
            background-color: white;
            border-radius: 50%;
            margin-right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2em;
            font-weight: bold;
            color: #2e7d32;
        }
        .sidebar-bottom .user-info p {
            margin: 0;
            font-size: 0.9em;
        }
        .sidebar-bottom .user-info .user-name {
            font-weight: bold;
        }
        .sidebar-bottom .logout-button {
            background-color: #e53935; /* Rojo para cerrar sesión */
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            width: 100%;
            text-align: left;
            margin-bottom: 15px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center; /* Centrar el texto y el icono */
            gap: 8px; /* Espacio entre icono y texto */
        }
        .sidebar-bottom .logout-button:hover {
            background-color: #c62828;
        }

        /* Main Content Styles */
        .main-content {
            flex-grow: 1;
            padding: 30px;
            background-color: #f0f2f5;
        }
        .header-bar {
            background-color: #4CAF50; /* Verde brillante de la cabecera */
            height: 60px;
            margin: -30px -30px 30px -30px; /* Para que ocupe todo el ancho arriba */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Columnas responsivas */
            gap: 25px;
        }
        .card {
            background-color: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .card-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #e8f5e9; /* Fondo claro para el icono */
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            color: #4CAF50; /* Color del icono */
            margin-bottom: 15px;
            font-weight: bold;
        }
        .card-value {
            font-size: 2.5em;
            font-weight: 700;
            color: #333;
            margin-bottom: 5px;
        }
        .card-title {
            font-size: 1.1em;
            color: #555;
            margin-bottom: 10px;
        }
        .card-trend {
            font-size: 0.9em;
            padding: 5px 10px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 500;
        }
        .card-trend.positive {
            background-color: #e8f5e9; /* Verde claro */
            color: #2e7d32; /* Verde oscuro */
        }
        .card-trend.negative {
            background-color: #ffebee; /* Rojo claro */
            color: #c62828; /* Rojo oscuro */
        }
        /* Para simular iconos sin Font Awesome */
        .icon-r:before { content: 'R'; }
        .icon-cloud:before { content: '☁️'; } /* Nube */
        .icon-clock:before { content: '⏰'; } /* Reloj */
        .icon-check:before { content: '✔️'; } /* Check */
        .icon-home:before { content: '🏠'; }
        .icon-folder:before { content: '📁'; }
        .icon-users:before { content: '👥'; }
        .icon-clipboard:before { content: '📋'; }
        .icon-logout:before { content: '➡️'; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div>
            <div class="sidebar-header">
                <div class="logo">🌳</div> <div class="app-name">SENA</div>
                <div class="tagline">COORDINACIÓN ADSO</div>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li><a href="#" class="active"><i class="icon-home"></i> DASHBOARD</a></li>
                    <li><a href="#"><i class="icon-folder"></i> CASOS</a></li>
                    <li><a href="#"><i class="icon-users"></i> USUARIOS</a></li>
                    <li><a href="#"><i class="icon-clipboard"></i> PRÉSTAMOS</a></li>
                </ul>
            </nav>
        </div>
        <div class="sidebar-bottom">
            <button class="logout-button"><i class="icon-logout"></i> CERRAR SESIÓN</button>
            <div class="user-profile">
                <div class="user-avatar">GA</div>
                <div class="user-info">
                    <p class="user-name">{{ $username ?? 'Giovanni Agudelo Fique' }}</p>
                    <p>Usuario Coordinador</p>
                </div>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="header-bar"></div> <div class="dashboard-grid">
            <div class="card">
                <div class="card-icon icon-r"></div>
                <div class="card-value">324</div>
                <div class="card-title">usuarios registrados</div>
                <div class="card-trend positive">+8% vs mes anterior</div>
            </div>

            <div class="card">
                <div class="card-icon icon-cloud"></div>
                <div class="card-value">1,247</div>
                <div class="card-title">Casos Activos</div>
                <div class="card-trend positive">+12% vs mes anterior</div>
            </div>

            <div class="card">
                <div class="card-icon icon-clock"></div>
                <div class="card-value">89</div>
                <div class="card-title">Casos Pendientes</div>
                <div class="card-trend negative">-5% vs mes anterior</div>
            </div>

            <div class="card">
                <div class="card-icon icon-check"></div>
                <div class="card-value">156</div>
                <div class="card-title">Casos Resueltos</div>
                <div class="card-trend positive">+23% vs mes anterior</div>
            </div>
        </div>
    </div>
</body>
</html>