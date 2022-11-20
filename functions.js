const formatJSON = ( filmObject ) => {
    return {
      "title": filmObject.original_title,
      "description": filmObject.overview,
      "picture_url": `https://image.tmdb.org/t/p/w220_and_h330_face/${filmObject.poster_path}`,
      "adult": filmObject.adult,
      "price": Math.floor(Math.random() * (20 - 10 + 1)) + 10
    }
};

const success = ( data ) => {return { success: true, data: data }};

const fail = ( message ) => {return { success: false, error: message }};

module.exports = { formatJSON, fail, success };