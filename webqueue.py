#!/venv/python2/bin/python

import pymongo
from gevent.greenlet import greenlet
import gevent
from gevent import Greenlet
from pymongo import MongoClient
import re
import requests
from bs4 import BeautifulSoup
import hashlib
import sys
import ssl
import os
import subprocess

websites = {}
stack = []
links = set()

discoveredPages = set()
protocols = set(["http", "https"])

website = "https://www.cse.msu.edu/~cse232/"

class Websites(object):
    client = MongoClient()
    db = client.websites
    collection = db.websites

    def __getitem__(self, key):
        return self.collection.find_one({"node" : key})

    def __setitem__(self, key, value):
        outnodes = self[key]
        if(outnodes is not None):
            self.collection.update({"_id":outnodes["_id"]}, {"$addToSet":{"outdegrees": value}})
            pass
        else:
            outnodes = {"node" : key, "outdegrees": [value, ]}
            self.collection.insert_one(outnodes)
            pass
        pass

    def addNode(self, key, value):
        set_ = self[key]
        if(set_ is None):
            self[key] = value
            return
        set_ = set(set_)
        if(value not in set_):
            self[key] = value
            pass
        pass

websites = Websites()

class Things(object):
    client = MongoClient()
    db = client.queue
    collection = db.queue
    inserted = 0

    def put(self, url):
        queue = {"inserted" : Things.inserted, "url" : url}
        self.collection.insert_one(queue)
        Things.inserted += 1
        pass

    def get(self):
        objects = self.collection.find().sort("inserted", pymongo.ASCENDING)[0]
        self.db.queue.delete_many({"inserted":objects["inserted"]})
        return objects["url"]

    def empty(self):
        return self.collection.count() == 0

class MongoSet(object):
    client = MongoClient()
    db = client.sets
    collection = db.set
    inserted = 0

    def add(self, value):
        fuckYouTwo = {"value" : value}
        self.collection.insert_one(fuckYouTwo)
        pass

    def __contains__(self, key):
        if(self.collection.find_one({"value":key})):
            return True
        return False

websiteQueue = Things()
discoveredPages = MongoSet()
discoverdSites = MongoSet()

def crawlPage(base, webPage, site_links):
    global website
    global websiteQueue
    global stack
    global protocols
    global discoveredSites
    global discoveredPages
    global links

    
    soup = BeautifulSoup(webPage.text, 'html.parser')
    hsh = "{0}_{1}".format(hashlib.md5(webPage.text.encode("utf-8")).hexdigest(), hashlib.sha1(webPage.text.encode("utf-8")).hexdigest())
    discoveredPages.add(hsh)
    
    for i in soup.find_all('a'):
        if(not i.has_attr("href")):
            continue
        link = i["href"]
        if(link in site_links):
            continue
        site_links.add(link)
        protocol = link.split("//")
        link_hash = link.strip("#")
        link_query = link.strip("?")
        if (link_hash == ""):
            continue
        if(link_query == ""):
            continue
        if(type(link_hash) == list ):
            link = link_hash[0]
        if(type(link_query) == list):
            link = link_query[0]
            pass
        linkRe = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', link)
        fileType = link.split(".")[-1]
        if (fileType == "pdf"):
            continue
        if(linkRe != []):
            link_list = link.split('/')
            ll = []
            for i in link_list:
                if i:
                    ll.append(i)
                    pass
                pass
            link_list = ll
            link_stripped = "{0}//{1}/".format(link_list[0], link_list[1])
            if link_stripped == base:
                link = "{0}/{1}".format(base, link)
                glet = Greenlet.spawn(loadsite, link)
                try:
                    webPage = glet.get(timeout=10)
                except gevent.Timeout:
                    continue
                if("text/html" not in webPage.headers['Content-Type']):
                    continue
                hsh = "{0}_{1}".format(hashlib.md5(webPage.text.encode("utf-8")).hexdigest(), hashlib.sha1(webPage.text.encode("utf-8")).hexdigest())
                if(hsh not in discoveredPages):
                    crawlPage(base, webPage, site_links)
                webPage = None
                continue
            link = link_stripped
            websites.addNode(base, link)
            if(link not in discoverdSites):
                discoverdSites.add(link)
                websiteQueue.put(link)
                pass
        else:
            link = "{0}/{1}".format(base, link)
            glet = Greenlet.spawn(loadsite, link)
            try:
                webPage = glet.get(timeout=10)
            except gevent.Timeout:
                continue
            hsh = "{0}_{1}".format(hashlib.md5(webPage.text.encode("utf-8")).hexdigest(), hashlib.sha1(webPage.text.encode("utf-8")).hexdigest())
            if(hsh not in discoveredPages):
                crawlPage(base, webPage, site_links)
                pass
            webPage = None
            pass
        pass
    pass

def loadsite(link):
    try:
        webPage = requests.get(link)
        return webPage
    except:
        pass

def crawlSite(basePage, emmiter=None):
    global website
    global websiteQueue
    global stack
    global protocols
    global discoveredSites
    if(basePage in discoverdSites):
        return
    discoverdSites.add(link)
    websiteQueue.put(basePage)
    level = 0
   
    rlets = []
    while(not websiteQueue.empty()):
        website = _someBSForGevent( websiteQueue, level)
        print "Emititing the emmiter"
        if(emmiter is not None):
            emmiter("canUpdate", {"file" : website})
        print "Emited the emmiter"
        pass
    pass

def _someBSForGevent(websiteQueue, level):
    level += 1
    website = websiteQueue.get()
    webPage = requests.get(website)
    try:
        crawlPage(website, webPage, set())
    except ssl.SSLError:
        pass
    return website

def checkSite(basePage, emiter):
    link = Websites.collection.find_one({"node" : basePage})
    if link is not None:
        print "return shit"
        return {link["node"]: link["outdegrees"]}
    else:
        print 
        subprocess.call(["/home/azureuser/webqueue.py", basePage])

if __name__ == '__main__':
    pid = os.fork()
    if pid > 0:
        sys.exit(0)
    if(len(sys.argv) > 1):
        crawlSite(sys.argv[1])
        pass
