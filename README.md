Art Explorer
============
Application that allows users to search for a museum and retrieve information about the artworks within that museum. API built using Node.js and MongoDB.

To Do
============
1. Retrieve list of popular museums
2. Retrieve information on each individual museum
3. Retrieve list of artworks in each museum
4. Retrieve information on each piece of artwork
5. Retrieve information on each artist

Scope
============
1. Search page: Search for a museum, artwork, artist.
2. Museum page: Display a list of artworks in that museum
3. Artwork page: View image and general information about the artwork
4. Artist page: View general information about the artist and a list of their artworks

Methods
============
* GET /museums - returns a list of museums
* GET /museums/:id - returns a museum
* GET /museums/:id/artworks - returns a list of artworks in the museum
* POST /museums - adds a new museum
* POST /artworks - adds a new artwork
* POST /artist - adds a new artist

Art.sy API
============
* Search for an artist: http://art.sy/api/v1/match/artists?term=warhol 
* Search for an artwork: http://art.sy/api/v1/match/artworks?term=guernica 
* Search for information on an artist: http://art.sy/api/v1/artist/andy-warhol
* Search for a list of artworks by an artist: http://art.sy/api/v1/artist/andy-warhol/artworks
* Search for an artwork: http://art.sy/api/v1/artwork/andy-warhol-flowers-8 
