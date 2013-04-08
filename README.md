Art Explorer
============
Application that allows users to search for a museum and retrieve information about the artworks within that museum. API built using Node.js, MongoDB, and Express.

Data
============
Compiled from http://www.freebase.com/schema/visual_art 

To Do
============
1. Fix nearby locations
2. Create more categories
3. Create a navigation menu on homepage
4. Add Google Maps display on museum page
5. Allow searches by city
6. Allow searchs by artwork

Scope
============
1. Search page: Search for a museum, artwork, artist.
2. Museum page: Display a list of artworks in that museum
3. Artwork page: View image and general information about the artwork
4. Artist page: View general information about the artist and a list of their artworks

Active Methods
============
* GET /museums - returns a list of museums
* GET /museums/:id - returns a museum
* GET /museums/:id/artworks - returns a list of artworks in the museum
* GET /artists - returns a list of artists
* GET /artists/:id - returns an artist
* GET /artworks - returns a list of artworks
* GET /artworks/:id - returns an artwork

Art.sy API
============
* Search for an artist: http://art.sy/api/v1/match/artists?term=warhol 
* Search for an artwork: http://art.sy/api/v1/match/artworks?term=guernica 
* Search for information on an artist: http://art.sy/api/v1/artist/andy-warhol
* Search for a list of artworks by an artist: http://art.sy/api/v1/artist/andy-warhol/artworks
* Search for an artwork: http://art.sy/api/v1/artwork/andy-warhol-flowers-8 
