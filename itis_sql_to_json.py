#!/usr/bin/env python	
import sys
import re
import json

#more imports
from sqlalchemy import *

Usage = """
Usage:

itis_sql_to_json.py taxonomic_units strippedauthor root

Parses itis taxonomy into a tree encoded in json

Each node has an associated date. For tips, it is the date on which the species was 
described. For internal nodes, it is the date that the youngest descendent species was 
described.

taxonomic_units and strippedauthor are from the itis dataset is available at:
 http://www.itis.gov/downloads/itisMySQLTables.tar.gz

root is the id of the root of the subtree that you would like to export


"""


"""
Create Table taxonomic_units 
 ( tsn INTEGER NOT NULL,
   unit_ind1 CHAR(1),
   unit_name1 CHAR(35) NOT NULL,
   unit_ind2 CHAR(1),
   unit_name2 VARCHAR(35),
   unit_ind3 VARCHAR(7),
   unit_name3 VARCHAR(35),
   unit_ind4 VARCHAR(7),
   unit_name4 VARCHAR(35),
   unnamed_taxon_ind CHAR(1),
   name_usage VARCHAR(12) NOT NULL,
   unaccept_reason VARCHAR(50),
   credibility_rtng VARCHAR(40) NOT NULL,
   completeness_rtng CHAR(10),
   currency_rating CHAR(7),
   phylo_sort_seq SMALLINT,
   initial_time_stamp DATETIME NOT NULL,
   parent_tsn INTEGER,
   taxon_author_id INTEGER,
   hybrid_author_id INTEGER,
   kingdom_id SMALLINT NOT NULL,
   rank_id  SMALLINT NOT NULL,
   update_date DATE NOT NULL,
   uncertain_prnt_ind CHAR(3),
   INDEX taxon_unit_index1 (tsn,parent_tsn),
   INDEX taxon_unit_index2 (tsn,unit_name1,name_usage),
   INDEX taxon_unit_index3 (kingdom_id,rank_id),
   INDEX taxon_unit_index4 (tsn,taxon_author_id),
   PRIMARY KEY (tsn))
   ENGINE=MyISAM CHARSET=latin1;

Create Table strippedauthor
 ( taxon_author_id INTEGER NOT NULL,
   shortauthor VARCHAR(100) NOT NULL,
   INDEX (taxon_author_id,shortauthor),
   PRIMARY KEY (taxon_author_id))
   ENGINE=MyISAM CHARSET=latin1;


"""

# The minimum year to assign a date. This is necessary to clean up data that would 
# otherwise come to dominate at deep nodes. Using the publication data of Systema Naturae, 
# http://en.wikipedia.org/wiki/Systema_Naturae
min_year = 1735

# tsn, usage, parent_tsn, unit_name1, 
class Taxon():
	"""A Taxon """
#	def __init__(self, taxonomic_unit_sting = ''):
# (900081L, '', 'Neastacilla', '', 'coonabooloo', '', '', '', '', 'N', 'valid', '', 'TWG standards met', '', '', 0, datetime.datetime(2013, 1, 29, 8, 54, 1), 92557L, 165408L, 0L, 5, 220, datetime.date(2013, 1, 29), 'No', 'valid', 'Neastacilla coonabooloo')
        def __init__(self, fields = ()):
            # parse the line in the database
        #	taxonomic_unit_sting = taxonomic_unit_sting.rstrip()
        #	fields = taxonomic_unit_sting.split('|')
		expected_fields = 26 
		if len(fields) < expected_fields:
			raise ValueError('The following taxonomic_unit_sting does not have {0} fields:\n  {1}\n'.format(expected_fields, fields))
		self.id = int( fields[0] ) # 900081 (tsn)
		self.name_usage = fields[10] # valid (usage)
		
		self.parent = -1
		parent_string = fields[17]
		try:
			self.parent = int( parent_string ) #92557 (parent_tsn)
		except:
			sys.stderr.write( 'WARNING: Invalid parent id in the string: {0}\n'.format( taxonomic_unit_sting ) )
		self.children = list()
		self.name = fields[2] # 'Neastacilla' (unit_name1)
		self.author_id = -1
		try:
			self.author_id = int( fields[ 18 ] ) #165408 (author_id)
		except:
			sys.stderr.write( 'WARNING: Invalid taxon_author_id in the string: {0}\n'.format( taxonomic_unit_sting ) )
		
		self.author = ''
		self.year = None
		if len( fields[4] ) > 0: #'coonabooloo' (unit_name2)
			self.name = self.name + ' ' + fields[4]
	
	
	def is_valid(self):
		"""True if the taxon is considered valid"""
		if ( self.name_usage == 'valid' ) or ( self.name_usage == 'accepted' ):
			return True
		else:
			return False
			
	def is_tip(self):
		if len(self.children ) < 1:
			return True
		else:
			return False
	
	def add_child(self, child):
		"""Adds a child"""
		self.children.append( child )
	
	def pretty_print(self):
		"""return fields as a pretty string"""
		print('  id: {0}'.format(self.id))
		print('  name: {0}'.format(self.name))
		print('  parent: {0}'.format(self.parent))
		print('  name_usage: {0}'.format(self.name_usage))
		print('  is_valid: {0}'.format(self.is_valid()))
		print('  children: {0}'.format(self.children))
		
		print('  author: {0}'.format(self.author))
		print('  year: {0}'.format(self.year))
		
		print('')
		
	def csv(self):
		"""return fields in csv format"""
		return '{0},{1},{2},{3}'.format(self.id, self.parent, self.name, self.year)
		
	def dict(self):
		"""return fields in dictionary format"""
		
		return { 'id':self.id, 'parent':self.parent, 'name':self.name, 'year':self.year }
		
	def node(self):
		"""Get node data in d3.json format"""
		# {"name":"Napoleon","group":1}
		return {"name":self.name, "group":1, "year":self.year, "itis_id":self.id}
		
	def link(self):
		"""Get the subtending branch in d3.json format"""
		# {"source":1,"target":0,"value":1}
		return {"source":self.parent,"target":self.id,"value":1}
		
def find_descendents_recursive(tsn_list, taxa_dict):
    if not tsn_list:
        return
    for tsn in tsn_list:
      direct_children_tsn_s = select([tu]).where(tu.c.parent_tsn==tsn)
      direct_children_tsn_result = conn.execute(direct_children_tsn_s)
      direct_children_tsn_list = [Taxon(child) for child in direct_children_tsn_result]
      for child in direct_children_tsn_list:
          if(child.author_id):
             child.year = authors[child.author_id]
             # Add id/taxon mapping for child
          else:
              sys.stderr.write("Warning: child {0} has no author data".format(child.id))
          taxa_dict[child.id] = child
          taxa_dict[tsn].add_child(child.id) # Add all child_id to child id list in parent     
      find_descendents_recursive([child.id for child in direct_children_tsn_list], taxa_dict)
    
try:
    engine = create_engine('mysql+pymysql://root:@localhost/ITIS')
    conn = engine.connect()
    metadata = MetaData(engine)
    tu = Table('taxonomic_units', metadata, autoload=True)
    sa = Table('strippedauthor', metadata, autoload=True)
    authors = dict()
except:
    sys.exit('Problem connecting to database; goodbye')

#if len(sys.argv) < 4:
#	print Usage
if len(sys.argv) != 2:
    print Usage
else:
    # Connect to the ITIS database
    n = 0
    taxa = dict()
    root_tsn = int(sys.argv[1])
    root_s = select([tu]).where(tu.c.tsn==root_tsn) 
    root_res = conn.execute(root_s)
    root = [r for r in root_res][0]
    new_taxon = Taxon(root)
    root_tsn = int(root[0])
    taxa[ root_tsn ] = new_taxon
        # new_taxon = Taxon( line )
        # new_taxon.pretty_print()

    # Read the strippedauthor table into an in-memory store
    authors_s = select([sa.c.taxon_author_id, sa.c.shortauthor])
    author_res = conn.execute(authors_s)
    for author in author_res:
        author_id = author[0]
        shortauthor = author[1]
        author_year_words = shortauthor.split(' ')
        year_string = author_year_words[-1]
        year = None

        if re.match('^\d\d\d\d$', year_string):
            year = int(year_string)
        if year < min_year:
            year = None

        authors[ author_id ] = year 
    
    find_descendents_recursive([ root_tsn ], taxa)
    if new_taxon.is_valid():
        # Scrub the year from internal nodes, since going to propagate these back from the tips
	for id in taxa.iterkeys():
		if not taxa[ id ].is_tip():
			taxa[ id ].year = None
			
	# Propagate years back in tree
	# Loop over tips that have year datum
	for id in taxa.iterkeys():
		if taxa[ id ].is_tip() and taxa[ id ].year:
			# Now traverse the ancestors of the tip, updating if need be
			taxon_pointer = id
			#sys.stderr.write( 'VERBOSE: updating ancestors of tip {0}, year {1}\n'.format( taxon_pointer, taxa[ taxon_pointer ].year ) )
			while taxon_pointer:
				# See if the taxon has a valid parent
				parent = taxa[ taxon_pointer ].parent
				if parent in taxa:
					# Parent exists
					# Check to see of the year should be updated
					if (taxa[ taxon_pointer ].year) and ((taxa[ taxon_pointer ].year < taxa[ parent ].year) or ( taxa[ parent ].year == None )):
						taxa[ parent ].year = taxa[ taxon_pointer ].year	# Update the parent year
						taxon_pointer = parent	# Iterate the pointer to the parent
					else:
						taxon_pointer = None	# All done with this lineage
						
				else:
					# Parent doesn't exist, all done
					taxon_pointer = None
	
	# Now, traverse the tree from the user specified root
	node_stack = list()
	node_stack.append( root_tsn )
	
	tree = { 'nodes':[], 'links':[] }  # a dictionary of nodes and links in the tree
	
	node_lookup = dict() # Maps from original itis node id to position in tree['nodes'] list
	
	
	#print 'id,parent,name,year'
 	while len( node_stack ) > 0:
 		id = node_stack.pop()
 		# Only include lineages for which there is a date
 		if taxa[ id ].year:
 			tree['nodes'].append( taxa[ id ].node() )
 			node_lookup[ id ] = len(tree['nodes']) - 1
 			if id != root_tsn:
 				tree['links'].append( {"source" : node_lookup[ taxa[ id ].parent ],"target" : node_lookup[ id ],"value":1} )
 				
 			node_stack = node_stack + taxa[ id ].children
 			
 			
 	print json.dumps( tree, indent = 3 )
