### encoding: utf8 
import urllib2
import json
import math
import sys
import random

try:
    votes_api = json.loads(file('in.json').read())
except:
    votes_api = urllib2.urlopen('http://oknesset.org/api/vote/?page_len=10000').read()
    file('in.json','w').write(votes_api)
    votes_api = json.loads(votes_api)

not_current_mks = [100,115,697]
bad_votes = [459, 654, 1734, 517, 428, 426, 367, 327, 164]

all_titles = set()
all_mks = {}
all_votes = []
for v in votes_api:
    vid = int(v["url"].split("/")[2])
    
    x = v["title"]
    if x in all_titles:
        continue
    all_titles.add(x)
    #print vid, x[-1::-1]

    if not u'להעביר את הצעת החוק לוועדה' in v["title"]:
        continue    
#    if not u'אישור החוק' in v["title"]:
#        continue
#    if v["summary"] == None or v["summary"] == "":
#        continue
    if vid in bad_votes:
        continue 

    v["title"] = v["title"][28:]

    all_votes.append(vid)
    for mk in not_current_mks:
        if mk in v["for_votes"]: 
            v["for_votes"].remove(mk)
        if mk in v["against_votes"]: 
            v["against_votes"].remove(mk)
    
    for mk in v["for_votes"]:
        all_mks[mk] = []
    for mk in v["against_votes"]:
        all_mks[mk] = []    

for v in votes_api: 
    vid = int(v["url"].split("/")[2])
    if not vid in all_votes:
        continue
    
    for mk in all_mks.keys():
        if mk in v["for_votes"]:
            all_mks[mk].append(1)
        elif mk in v["against_votes"]:
            all_mks[mk].append(-1)
        else:
            all_mks[mk].append(0)

print "considering %d mks" % len(all_mks)
print "considering %d votes" % len(all_votes)

dist_prep={}
def prepare_mutual_distances():
    mks = all_mks.keys()
    for i1 in range(len(mks)):
        mk1 = all_mks[mks[i1]]
        assert(len(mk1)==len(all_votes))
        for i2 in range(i1+1,len(mks)):
            mk2 = all_mks[mks[i2]]
            sum_mk = sum(map(lambda x,y:(x-y)**2, mk1,mk2))
            dist_prep[(i1,i2)]=sum_mk
    #sys.stdout.write(". %s %s" % (no_vote,dist))
    print ",",
    sys.stdout.flush()
    #return dist   

def calc_mutual_distances(no_vote):
    dist = 0
    mks = all_mks.keys()
    for i1 in range(len(mks)):
        mk1 = all_mks[mks[i1]]
        for i2 in range(i1+1,len(mks)):
            mk2 = all_mks[mks[i2]]
            sum_mk = dist_prep[(i1,i2)]#sum(map(lambda x,y:(x-y)**2, mk1,mk2))
            sum_mk -= (mk1[no_vote] - mk2[no_vote]) ** 2 
            sum_mk = math.sqrt(sum_mk)
            dist += sum_mk
    #sys.stdout.write(". %s %s" % (no_vote,dist))
    #print ". %s %s" % (no_vote,dist)
    sys.stdout.flush()
    return dist

def del_vote(x):
    print "del=%s" % x
    all_votes.pop(x)
    for mk in all_mks.keys():
        all_mks[mk].pop(x)

while len(all_votes) > 30:
    print "len=%s" % len(all_votes), 
    prepare_mutual_distances()
    del_vote( max([ (x,calc_mutual_distances(x)) for x in range(len(all_votes)) ], key=lambda x:x[1])[0] )
    
for v in votes_api:
    vid = int(v["url"].split("/")[2])
    if vid in all_votes:
        x = v["title"]
        print "%d: %-80s" % (vid, x.replace('(','X').replace(')','(').replace('X',')'))

#s = all_votes 
mks_match = {}
for mk in all_mks.keys():
    mks_match[mk] = 0

#def gen_votes(l,v):
#    if len(l) < len(s):
#        gen_votes(l+[-1],v*2)
#        gen_votes(l+[1],v*2+1)
#        return
#    cors = []
#    for mk,votes in all_mks.iteritems():
#        cor = sum(map(lambda x,y:x*y,votes,l))
##        cor = 0
##        for vv,ll in zip(votes,l):
##            #cor -= (vv-ll)**2
##            cor += vv*ll
#        cors.append((mk,cor))
#    cors.sort(key=lambda x:x[1], reverse=True)
#    mks_match[cors[0][0]]+=cors[0][1]
#    if v % 100000 == 0:
#        print v
#        print mks_match.values()
#
#gen_votes([],0)

#for _ in range(10000):
#    l = [ random.randint(0,1)*2 - 1 for _ in all_votes ]
#    cors = []
#    for mk,votes in all_mks.iteritems():
#        cor = sum(map(lambda x,y:x*y,votes,l))
#        cors.append((mk,cor))
#    cors.sort(key=lambda x:x[1], reverse=True)
#    mks_match[cors[0][0]]+=cors[0][1]   
#
#mk_cors = list(mks_match.iteritems())
#mk_cors.sort(key=lambda x:x[1], reverse=True)

print all_votes
#print mk_cors

mi = all_mks.keys()
mv = [ all_mks[k] for k in mi ]
mp = [ json.loads(urllib2.urlopen('http://oknesset.org/api/member/%s' % k).read())["votes_per_month"] for k in mi ]
file('data.js','w').write('var data = %s;' % json.dumps( {'v':all_votes,'mv':mv,'mi':mi,'mp':mp},indent=0))
