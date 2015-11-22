#! /usr/bin/python
import csv
import datetime
from collections import defaultdict
"""
This script reduces the size of movement dataset
Normally the movement of a person is recorded on average every 10 seconds
This script transform the movement data such that a person's coordinate is recorded every 10 minutes
"""

class Node:
    def __init__(self, prev, timestamp, x, y):
        self.prev = prev
        self.next = None
        self.timestamp = timestamp
        self.x = x
        self.y = y
        if prev == None:
            self.first = self
        else:
            self.first = prev.first

d = {}
coordinate_dict = defaultdict(list)

def time_diff(a, b):
    # Little hack here to save some work
    if a == None:
        return 99999
    t1 = datetime.datetime.strptime(a, "%Y-%m-%d %H:%M:%S")
    t2 = datetime.datetime.strptime(b, "%Y-%m-%d %H:%M:%S")

    return (t2 - t1).seconds

def transform():
    with open('../data/park-movement-Fri-FIXED-2.0.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader, None)
        try:
            for (timestamp, id, type, x, y) in reader:
                if id in d:
                    prev = d[id]
                    new = Node(prev, timestamp, x, y)

                    prev.next = new
                    d[id] = new
                else:
                    d[id] = Node(None, timestamp, x, y)
        except ValueError:
            print(timestamp, id)

    for (id, node) in d.items():
        cur = node.first
        last_t = None

        while cur:
            if time_diff(last_t, cur.timestamp) >= 5 * 60:
                coordinate_dict[id].append({'x': cur.x, 'y': cur.y, 'timestamp': cur.timestamp})
                last_t = cur.timestamp
            cur = cur.next

    with open('./out2.csv', 'w') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'id', 'X', 'Y'])
        for (id, coordinate_list) in coordinate_dict.items():
            for coordinate in coordinate_list:
                writer.writerow([coordinate['timestamp'], id, coordinate['x'], coordinate['y']])



if __name__ == '__main__':
    transform()
