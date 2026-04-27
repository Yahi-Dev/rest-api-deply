import mysql from "mysql2/promise";
import "dotenv/config";

const config = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT) : 3306,
};

const pool = mysql.createPool(config);

export class MovieModel {
  
  static async getAllMovies({ genre }) {
    const connection = await pool.getConnection();
    try {
      if (genre) {
        const [rows] = await connection.query(
          `SELECT 
            BIN_TO_UUID(m.id) as id, 
            m.title, 
            m.year, 
            m.director, 
            m.duration, 
            m.poster, 
            m.rate,
            GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ',') as genres
           FROM movie m
           JOIN movie_genres mg ON m.id = mg.movie_id
           JOIN genre g ON mg.genre_id = g.id
           WHERE LOWER(g.name) = LOWER(?)
           GROUP BY m.id`,
          [genre]
        );
        
        const movies = rows.map(movie => ({
          ...movie,
          genres: movie.genres ? movie.genres.split(',') : []
        }));
        
        return movies;
      } else {
        const [rows] = await connection.query(
          `SELECT 
            BIN_TO_UUID(m.id) as id, 
            m.title, 
            m.year, 
            m.director, 
            m.duration, 
            m.poster, 
            m.rate,
            GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ',') as genres
           FROM movie m
           LEFT JOIN movie_genres mg ON m.id = mg.movie_id
           LEFT JOIN genre g ON mg.genre_id = g.id
           GROUP BY m.id`
        );
        
        const movies = rows.map(movie => ({
          ...movie,
          genres: movie.genres ? movie.genres.split(',') : []
        }));
        
        return movies;
      }
    } catch (error) {
      console.error('Database error in getAllMovies:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getMovieById({ id }) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          BIN_TO_UUID(m.id) as id, 
          m.title, 
          m.year, 
          m.director, 
          m.duration, 
          m.poster, 
          m.rate,
          GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ',') as genres
         FROM movie m
         LEFT JOIN movie_genres mg ON m.id = mg.movie_id
         LEFT JOIN genre g ON mg.genre_id = g.id
         WHERE m.id = UUID_TO_BIN(?)
         GROUP BY m.id`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      const movie = rows[0];
      return {
        ...movie,
        genres: movie.genres ? movie.genres.split(',') : []
      };
    } catch (error) {
      console.error('Database error in getMovieById:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async createMovie({ input }) {
    const connection = await pool.getConnection();
    try {
      const { title, year, director, duration, poster, rate, genre } = input;
      const id = crypto.randomUUID();
      
      await connection.beginTransaction();
      
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate) 
         VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
        [id, title, year, director, duration, poster, rate]
      );
      
      for (const genreName of genre) {
        const [genreRows] = await connection.query(
          'SELECT id FROM genre WHERE name = ?',
          [genreName]
        );
        
        if (genreRows.length > 0) {
          await connection.query(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)',
            [id, genreRows[0].id]
          );
        }
      }
      
      await connection.commit();
      return { id, ...input };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteMovie({ id }) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'DELETE FROM movie WHERE id = UUID_TO_BIN(?)',
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async updateMovie({ id, input }) {
    const connection = await pool.getConnection();
    try {
      const { title, year, director, duration, poster, rate, genre } = input;
      
      const updates = [];
      const values = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (year !== undefined) {
        updates.push('year = ?');
        values.push(year);
      }
      if (director !== undefined) {
        updates.push('director = ?');
        values.push(director);
      }
      if (duration !== undefined) {
        updates.push('duration = ?');
        values.push(duration);
      }
      if (poster !== undefined) {
        updates.push('poster = ?');
        values.push(poster);
      }
      if (rate !== undefined) {
        updates.push('rate = ?');
        values.push(rate);
      }
      
      if (updates.length > 0) {
        values.push(id);
        await connection.query(
          `UPDATE movie SET ${updates.join(', ')} WHERE id = UUID_TO_BIN(?)`,
          values
        );
      }
      
      if (genre && genre.length > 0) {
        await connection.query(
          'DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)',
          [id]
        );
        
        for (const genreName of genre) {
          const [genreRows] = await connection.query(
            'SELECT id FROM genre WHERE name = ?',
            [genreName]
          );
          
          if (genreRows.length > 0) {
            await connection.query(
              'INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)',
              [id, genreRows[0].id]
            );
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Database error in updateMovie:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Helper: Convertir BINARY(16) a UUID string (por si acaso)
  static binToUuid(bin) {
    if (!bin) return null;
    const hex = bin.toString('hex');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
  }
}