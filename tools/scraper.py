"""
Author: Angela Panfil (panfia1@gmail.com)
Data scraper for Art Explorer
"""
import requests
import json
import re
import subprocess

"""
    Static variables
"""
url = 'https://www.googleapis.com/freebase/v1sandbox/mqlread?query='
database = 'art_explorer_test'
# Built these using http://www.freebase.com/queryeditor
# Key is the name of the collection
queries = {
    'art_owner': '[{"id":null,"name":null,"type":"/visual_art/art_owner","artworks_owned":[{}],"mid":[],"/common/topic/official_website":[],"/common/topic/article":[{"id":null}],"/common/topic/image":[{"id":null}],"limit":500}]',
    'artwork': '[{"id":null,"name":null,"type":"/visual_art/artwork","art_form":[],"art_genre":[],"art_subject":[],"artist":[],"date_begun":null,"date_completed":null,"dimensions_meters":null,"edition_of":[],"editions":[],"locations":[{}],"media":[],"mid":[],"owners":[],"period_or_movement":[],"support":[],"/common/topic/official_website":[],"/common/topic/article":[{"id":null}],"/common/topic/image":[{"id":null}],"limit":500}]',
    'visual_artist': '[{"id":null,"name":null,"type":"/visual_art/visual_artist","art_series":[],"artworks":[],"associated_periods_or_movements":[],"mid":[],"/common/topic/article":[{"id":null}],"/common/topic/image":[{"id":null}],"limit":500}]',
    'artwork_owner_relationship': '[{"id":null,"type":"/visual_art/artwork_owner_relationship","artwork":null,"date_acquired":null,"last_date_owned":null,"method_of_acquisition":null,"mid":[],"name":null,"owner":[],"limit":500}]'
}

""" 
    Parse JSON so it is formatted for Mongo
    Mongo expects each record to be on a separate line
    data: A Python dictionary, was originally generated from a JSON string
"""
def mongo_parse(data):
    # First grab only the data, removing result wrapper and any other meta data that came with the request
    parsed = data['result']
    
    first = parsed[0].keys()[0]

    # Convert back to a string
    dump = json.dumps(parsed)

    # Rename some of the fields that are ugly
    dump = re.sub('/common/topic/', '', dump)
    first = re.sub('/common/topic/', '', first)

    # Strip out the [ and ] at the beginning and end of the data
    stripped = dump[1:-1]

    # Make each record be on a new line
    divided = re.sub('}, {"' + first, '}\n{"' + first, stripped)

    # Should be all set to import into Mongo
    return divided

"""
    Import the provided json string into MongoDB
"""
def mongo_import(collection, filename):
    subprocess.call(['mongoimport', '-d',  database, '-c', collection, filename])
    return

"""
    Write a string to a file..complicated stuff
"""
def to_file(filename, string):
    f = open(filename, 'w+')
    f.write(string)
    return

def fetch_collection_data(collection):
    paging = True
    cursor = ""
    i = 0

    while paging:

        # Build the current URL
        currentUrl = url + queries[collection] + '&cursor=' + cursor

        # Make the request for the current URL
        request = requests.get(currentUrl);

        # If we were successful in making the request....
        print 'request %i completed with status %i' % (i, request.status_code)
        if request.status_code == 200:

            # Convert json response into a Python dictionary
            data = json.loads(request.text)

            # Write the parsed data to a json file
            filename = './json/' + str(i) + '.json'
            parsed = mongo_parse(data)
            to_file(filename, parsed)

            # Finally, import the data into Mongo
            mongo_import(collection, filename)

            # Grab the cursor in order to make the next request
            cursor = data['cursor']

        # Check to see if there are any subsequent requests
        if cursor is False:
            paging = False

        i += 1

    return

def main():
    for key in queries:
        print 'Fetching data for %s' % (key)
        fetch_collection_data(key)

    return
    
main()
