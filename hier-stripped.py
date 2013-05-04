#!/usr/bin/env python	
import sys
import re
import json
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


class Taxon():
	"""A Taxon """
	def __init__(self, taxonomic_unit_sting = ''):
		taxonomic_unit_sting = taxonomic_unit_sting.rstrip()
		fields = taxonomic_unit_sting.split('|')
		expected_fields = 18
		if len(fields) < expected_fields:
			raise ValueError('The following taxonomic_unit_sting does not have {0} fields:\n  {1}\n'.format(expected_fields, taxonomic_unit_sting))
		self.id = int( fields[0] )
		self.name_usage = fields[10]
		self.kingdom_id = fields[20]
		self.parent = -1
		parent_string = fields[17]
		try:
			self.parent = int( parent_string )
		except:
			sys.stderr.write( 'WARNING: Invalid parent id in the string: {0}\n'.format( taxonomic_unit_sting ) )
		self.children = list()
		self.name = fields[2]
		
		self.author_id = -1
		try:
			self.author_id = int( fields[ 18 ] )
		except:
			sys.stderr.write( 'WARNING: Invalid taxon_author_id in the string: {0}\n'.format( taxonomic_unit_sting ) )
		
		self.author = ''
		self.year = None
		if len( fields[4] ) > 0:
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

#                Column('tsn', Integer, primary_key=True, nullable=False),
#                Column('kingdom_id', Integer), 
#                Column('lft', Integer, nullable=False),
#                Column('rgt', Integer, nullable=False),
#                Column('date', Integer)
#                Index('kingdom_lft', 'lft', 'kingdom_id')
# 
def prep_for_database(tsn, left, depth):
    if len(values) > 20000:
        ins = phylotree_hierarchy.insert().values(values)
        conn.execute(ins)
        print ('Inserted {0} rows.'.format(len(values)))
        del values[:]
    right = left+1
    root_taxon = taxa[tsn]
    for child_id in root_taxon.children:
        right = prep_for_database(child_id, right, depth+1)
    values.append({'tsn': root_taxon.id, 'kingdom_id':root_taxon.kingdom_id, 'lft':left, 'rgt':right, 'parent_tsn':root_taxon.parent, 'depth':depth, 'year':root_taxon.year, 'name':root_taxon.name})
    return right+1
	
taxa = dict()
values = []
if len(sys.argv) < 3:
	print Usage
else:
	
    # Parse arguments
    taxon_file_name = sys.argv[1] #taxonomic_units
    author_file_name = sys.argv[2] #strippedauthor
    
    # Parse the authors file
    author_handle = open(author_file_name, "rU")
    
    n = 0
    authors = dict()
    
    for line in author_handle: # e.g.: 25 | A Binney 1842
    	n = n + 1
    	line = line.strip()
    	
    	#if n==1:
    	#	continue
    		
    	fields = line.split('|')
    	
    	author_id = int( fields[0] ) # 25
    	author_year = fields[1] # A Binney 1842
    	author_year_words = author_year.split(' ')
    	author = ' '.join(author_year_words[:-1])
    	year_string = author_year_words[-1:][0] # 1842
    	year = None
    	
    	#print( year_string )
    	
    	if re.match('^\d\d\d\d$', year_string):
    		year = int( year_string )
    	else:
    		author = author + ' ' + year_string
    	
    	if year < min_year:
    		year = None
    	
    	authors[ author_id ] = ( author, year  ) # authors[25] = (A Binney, 1842)) 
    	
    	
    	#print ( line )
    	#print( id, author, year )
    
    # Parse the taxonomy file into the taxa dictionary
    taxon_handle = open(taxon_file_name, "rU")
    
    n = 0
    
    for line in taxon_handle:
    	n = n + 1
    	line = line.strip()
    	
    	#if n==1:
    	#	continue
    	
    	new_taxon = Taxon( line )
    	#new_taxon.pretty_print()
    	if new_taxon.is_valid():
    		if new_taxon.author_id in authors: # join with author data
    			author_tuple = authors[ new_taxon.author_id ]
    			new_taxon.author = author_tuple[0]
    			new_taxon.year = author_tuple[1]
    		#new_taxon.pretty_print()
    		taxa[ new_taxon.id ] = new_taxon
    		
    # Update the children for each taxon
    for id in taxa.iterkeys():
    	parent = taxa[ id ].parent
    	if parent:
    		try:
    			taxa [ parent ].add_child( id )
    		except:
    			sys.stderr.write( 'WARNING: Node {0}, listed as the parent of {1}, does not exist\n'.format( parent, id ) )
    
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
    
    print ("***Finished constructing tree.")
    engine = create_engine('mysql+pymysql://root:@localhost/ITIS')
    conn = engine.connect()

    phylotree_hierarchy = Table()

    try:
        trans = conn.begin()
        metadata = MetaData(engine)
        kingdoms = Table('kingdoms', metadata, autoload=True)
        taxonomic_units = Table('taxonomic_units', metadata, autoload=True)
        phylotree_hierarchy = Table('phylotree_hierarchy', metadata,
                Column('tsn', Integer, primary_key=True, nullable=False),
                Column('kingdom_id', Integer), 
                Column('lft', Integer, nullable=False),
                Column('rgt', Integer, nullable=False),
		Column('parent_tsn', Integer, nullable=False),
                Column('depth', Integer, nullable=False),
                Column('year', Integer),
                Column('name', String(50)),
                Index('kingdom_lft', 'lft', 'kingdom_id')
                )
    
        metadata.create_all(engine)
    
        kingdoms = {
                1 : ('Monera' , 202420),
                2 : ('Protozoa' , 630577),
                3 : ('Plantae' , 202422),
                4 : ('Fungi' , 555705),
                5 : ('Animalia', 202423),
                6 : ('Chromista' ,  630578)
                }
        for kingdom_id in kingdoms:
            prep_for_database(kingdoms[kingdom_id][1], 0, 0)
            print ("***Finished inserting kingdom", kingdoms[kingdom_id][0])

        ins = phylotree_hierarchy.insert().values(values)
        conn.execute(ins)
        print ("Inserted {0} rows".format(len(values)))

        trans.commit()
    except:
        trans.rollback()
        raise
