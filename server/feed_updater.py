#!/usr/bin/python3

# This is to be run on a VM or just locally is fine too :)
# what I did was just scp it to an azure VM, and then just
# set up a cron job, nothing crazy!

import getopt
import json
import sys
import urllib.parse
from datetime import datetime, timezone

import requests

APP_KEY = "TODO: APP KEY"
BASE_URL = "https://cloud.feedly.com/v3/streams/"

def query_feed_contents(feed_id, last_updated):
    raw = requests.get(BASE_URL + urllib.parse.quote_plus(feed_id) + "/contents/?newerThan=" + last_updated)
    return json.loads(raw.content)

def update(url):
    # pull down all feeds
    feeds = json.loads(requests.get(url + "/feeds/", headers = { 'x-app-key': APP_KEY }).content)
    for feed in feeds:
        print("Updating " + feed['name'] + " (" + str(feed['feed_id']) + ")")
        contents = query_feed_contents(feed['feed_id'], feed['last_updated_at'])
        contents['updated'] = int(datetime.now(timezone.utc).timestamp())
        print("Got " + str(len(contents['items'])) + " messages...")
        requests.post(url + '/feeds/' + str(feed['id']) + "/update_feed/", json=contents)

def main(argv):
    url = ''
    try:
        opts, args = getopt.getopt(argv,"hu:",["url="])
    except getopt.GetoptError:
        print('feed_updater.py -url <url>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('feed_updater.py [-u, -url] <url>')
            sys.exit()
        elif opt in ("-u", "--u"):
            url = arg
    if not url:
        print("Missing URL")
        print('feed_updater.py [-u, -url] <url>')
    else:
        print("Starting Feed Updater for server: " + url)
        try:
            update(url)
        except Exception as e:
            print("Ran into exception :" + str(e))

if __name__ == "__main__":
   main(sys.argv[1:])
