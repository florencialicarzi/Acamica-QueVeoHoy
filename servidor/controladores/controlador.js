 var con = require("../lib/conexionbd");

console.log("<<< Empieza a ejecutarse el controlador");

function obtenerTodo(req, res) {
  //////////////////////FORMAR SQL WHERE/////////////////////////////
  var sqlWHERE = "WHERE 1=1 ";

  if (req.query.anio) {
    var anio = req.query.anio;
    sqlWHERE += " and anio = " + anio;
  }

  if (req.query.titulo) {
    var titulo = req.query.titulo;
    sqlWHERE += " and titulo like '%" + titulo + "%'";
  }

  if (req.query.genero) {
    var genero = req.query.genero;
      sqlWHERE += " and genero_id = " + genero;
  }

  if (req.query.columna_orden) {
    var columna_Orden = req.query.columna_orden;
    sqlWHERE += " ORDER BY " + columna_Orden + " ";
  }

  if(req.query.tipo_orden){
    var tipoOrden = req.query.tipo_orden;
    sqlWHERE += tipoOrden;
  }

  /////////////////////ESTABLECER VALORES PARA EL LIMIT/////////////////////

   if (req.query.cantidad) {
    var cantidad = req.query.cantidad;
  }else {
    var cantidad = 52;
  }

  if (req.query.pagina) {
    var pagina = (req.query.pagina - 1) * cantidad;
  }else {
    var pagina = 0;
  }
  //////////////////// ARMAR CONSULTA COMPLETA/////////////////////

  var sql = "SELECT * FROM pelicula  " + sqlWHERE + " LIMIT " + pagina + "," + cantidad + ";";

  console.log("<<< Consulta a realizar --> " + sql);

  con.query(sql, function(error, resultado, fields) {
    if (error) {
        return res.send("ERROR, consulta fallida");
    }

    var sqlTotalPelis = "SELECT COUNT(*) AS total FROM pelicula  " + sqlWHERE;

    con.query(sqlTotalPelis, function(error, total, fields) {
      if (error) {
          return res.send("ERROR, consulta fallida");
      }
      var response = {
      	  'peliculas' : resultado,
          'total': total[0].total
      };
      res.send(response);
    });
  });
}
 function obtenerGeneros(req,res){
 	var sql = "SELECT * FROM genero";

 	con.query(sql,function(error,resultado){
 		if (error) {
	        return res.send("ERROR, consulta fallida");
	    }
	    var response = {
	        'generos': resultado
	    };

	    res.send(response);
		});
 	}
 
  function obtenerPeliculaData(req, res){

		var idPelicula = req.params.id;
		var sqlDataPeli = "select titulo, anio, poster, trama, fecha_lanzamiento, genero.nombre, director, duracion, puntuacion from pelicula join genero on pelicula.genero_id = genero.id where pelicula.id = " + idPelicula;
		var sqlActores = "select nombre from actor	join actor_pelicula on actor_pelicula.actor_id = actor.id where actor_pelicula.pelicula_id = " + idPelicula;

		con.query(sqlDataPeli, function(error,datosGenerales){
			if(error){
				return res.send("ERROR AL OBTENER LOS DATOS DE LA PELICULA");
			}
			
			con.query(sqlActores, function(error,datosActores){
				if(error){
					return res.send("ERROR AL OBTENER LOS DATOS DE LOS ACTORES");
				}
			
			var datosPelicula = {
				pelicula : datosGenerales[0],
				actores: datosActores,

			}

			res.send(datosPelicula)

			});
		})
	}

	 function recomendarPelicula(req, res){

    var sqlWHERE = "WHERE 1=1 ";

    if (req.query.anio_pagina && req.query.anio_fin) {
      sqlWHERE += " and pelicula.anio BETWEEN " + req.query.anio_pagina + "  and " + req.query.anio_fin;
    }

    if (req.query.genero){
      sqlWHERE += "  and nombre ='" + req.query.genero + "'";
    }

    if (req.query.puntuacion) {
      sqlWHERE += "  and puntuacion = " + req.query.puntuacion;
    }

    var sql = "SELECT pelicula.titulo, pelicula.poster, pelicula.trama, pelicula.id, genero.nombre" + " FROM pelicula JOIN genero ON pelicula.genero_id = genero.id  " + sqlWHERE + " ";

    con.query(sql, function(error, resultado, fields){
      if (error) {
         return res.send("ERROR, consulta fallida");
      }

      var response = {
        'peliculas': resultado
      }
      res.send(response);
    });
  }

module.exports={
	obtenerTodo : obtenerTodo,
	obtenerGeneros : obtenerGeneros,
	obtenerPeliculaData : obtenerPeliculaData,
	recomendarPelicula : recomendarPelicula
}