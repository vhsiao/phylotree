DROP DATABASE IF EXISTS ITIS;
CREATE DATABASE IF NOT EXISTS ITIS CHARACTER SET latin1;
USE ITIS;
DROP TABLE IF EXISTS comments;
Create Table comments
 ( comment_id INTEGER NOT NULL,
   commentator VARCHAR(100),
   comment_detail TEXT(2000) NOT NULL,
   comment_time_stamp DATETIME NOT NULL,
   update_date DATE NOT NULL,
   INDEX comments_index (comment_id),
   PRIMARY KEY (comment_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS geographic_div;
Create Table geographic_div 
 ( tsn INTEGER NOT NULL,
   geographic_value VARCHAR(45) NOT NULL,
   update_date DATE NOT NULL,
   INDEX geographic_index (tsn,geographic_value),
   PRIMARY KEY (tsn,geographic_value))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS experts;
Create Table experts 
 ( expert_id_prefix CHAR(3) NOT NULL,
   expert_id INTEGER NOT NULL, 
   expert VARCHAR(100) NOT NULL,
   exp_comment VARCHAR(500), 
   update_date DATE NOT NULL,
   INDEX experts_index (expert_id_prefix,expert_id),
   PRIMARY KEY (expert_id_prefix,expert_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS hierarchy;
CREATE TABLE ITIS.hierarchy (
    hierarchy_string varchar(128) NOT NULL,
    TSN int(10) NOT NULL,
    Parent_TSN int(10),
    level int(10) NOT NULL,
    ChildrenCount int(10) NOT NULL,
    INDEX (hierarchy_string),
    PRIMARY KEY (hierarchy_string)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
DROP TABLE IF EXISTS jurisdiction;
Create Table jurisdiction 
 ( tsn INTEGER NOT NULL,
   jurisdiction_value VARCHAR(30) NOT NULL,
   origin VARCHAR(19) NOT NULL,
   update_date DATE NOT NULL,
   INDEX jurisdiction_index (tsn,jurisdiction_value),
   PRIMARY KEY (tsn,jurisdiction_value))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS kingdoms;
Create Table kingdoms 
 ( kingdom_id INTEGER NOT NULL,
   kingdom_name CHAR(10) NOT NULL,
   update_date DATE NOT NULL,
   INDEX kingdoms_index (kingdom_id,kingdom_name),
   PRIMARY KEY (kingdom_id)) 
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS longnames;
Create Table longnames
 ( tsn INTEGER NOT NULL,
   completename VARCHAR(164) NOT NULL,
   INDEX (tsn,completename),
   PRIMARY KEY (tsn))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS nodc_ids;
Create Table nodc_ids 
 ( nodc_id CHAR(12) NOT NULL,
   update_date DATE NOT NULL,
   tsn INTEGER NOT NULL,
   INDEX nodc_index (nodc_id,tsn),
   PRIMARY KEY (nodc_id,tsn))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS other_sources;
Create Table other_sources
 ( source_id_prefix CHAR(3) NOT NULL,
   source_id INTEGER NOT NULL,
   source_type CHAR(10) NOT NULL,
   source VARCHAR(64) NOT NULL,
   version CHAR(10) NOT NULL,
   acquisition_date DATE NOT NULL,
   source_comment VARCHAR(500),
   update_date DATE NOT NULL,
   INDEX other_sources_index (source_id_prefix,source_id),
   PRIMARY KEY (source_id_prefix,source_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS publications;
Create Table publications
 ( pub_id_prefix CHAR(3) NOT NULL,
   publication_id INTEGER NOT NULL,
   reference_author VARCHAR(100) NOT NULL,
   title VARCHAR(255),
   publication_name VARCHAR(255) NOT NULL,
   listed_pub_date date,
   actual_pub_date DATE NOT NULL,
   publisher VARCHAR(80),
   pub_place VARCHAR(40),
   isbn VARCHAR(16),
   issn VARCHAR(16),
   pages VARCHAR(15),
   pub_comment VARCHAR(500),
   update_date DATE NOT NULL,
   INDEX publications_index (pub_id_prefix,publication_id),
   PRIMARY KEY (pub_id_prefix,publication_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS strippedauthor;
Create Table strippedauthor
 ( taxon_author_id INTEGER NOT NULL,
   shortauthor VARCHAR(100) NOT NULL,
   INDEX (taxon_author_id,shortauthor),
   PRIMARY KEY (taxon_author_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS synonym_links;
Create Table synonym_links
 ( tsn INTEGER NOT NULL,
   tsn_accepted INTEGER NOT NULL,
   update_date DATE NOT NULL,
   INDEX synonym_links_index (tsn,tsn_accepted),
   PRIMARY KEY (tsn,tsn_accepted))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS taxon_authors_lkp;
Create Table taxon_authors_lkp 
 ( taxon_author_id INTEGER NOT NULL,
   taxon_author VARCHAR(100) NOT NULL,
   update_date DATE NOT NULL,
   kingdom_id SMALLINT NOT NULL,
   short_author VARCHAR(100),
   INDEX taxon_authors_id_index (taxon_author_id,taxon_author,kingdom_id),
   PRIMARY KEY (taxon_author_id,kingdom_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS taxon_unit_types;
Create Table taxon_unit_types 
 ( kingdom_id INTEGER NOT NULL,
   rank_id SMALLINT NOT NULL,
   rank_name CHAR(15) NOT NULL,
   dir_parent_rank_id SMALLINT NOT NULL,
   req_parent_rank_id SMALLINT NOT NULL,
   update_date DATE NOT NULL,
   INDEX taxon_ut_index (kingdom_id,rank_id),
   PRIMARY KEY (kingdom_id,rank_id)) 
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS taxonomic_units;
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
   `usage` VARCHAR(12) NOT NULL,
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
   name_usage VARCHAR(12) NOT NULL,
   complete_name VARCHAR(300),
   INDEX taxon_unit_index1 (tsn,parent_tsn),
   INDEX taxon_unit_index2 (tsn,unit_name1,name_usage),
   INDEX taxon_unit_index3 (kingdom_id,rank_id),
   INDEX taxon_unit_index4 (tsn,taxon_author_id),
   PRIMARY KEY (tsn))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS tu_comments_links;
Create Table tu_comments_links
 ( tsn INTEGER NOT NULL,
   comment_id INTEGER NOT NULL,
   update_date DATE NOT NULL,
   INDEX tu_comments_links_index (tsn,comment_id),
   PRIMARY KEY (tsn,comment_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS vernaculars;
Create Table vernaculars 
 ( tsn INTEGER NOT NULL REFERENCES taxonomic_units,
   vernacular_name VARCHAR(80) NOT NULL,
   language VARCHAR(15) NOT NULL,
   approved_ind CHAR(1),
   update_date DATE NOT NULL,
   vern_id INTEGER NOT NULL,
   INDEX vernaculars_index1 (tsn,vernacular_name,language),
   INDEX vernaculars_index2 (tsn,vern_id),
   PRIMARY KEY (tsn,vern_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS vern_ref_links;
Create Table vern_ref_links
 ( tsn INTEGER NOT NULL REFERENCES vernaculars,
   doc_id_prefix CHAR(3) NOT NULL,
   documentation_id INTEGER NOT NULL,
   update_date DATE NOT NULL,
   vern_id INTEGER NOT NULL REFERENCES vernaculars,
   INDEX vern_rl_index1 (tsn,doc_id_prefix,documentation_id),
   INDEX vern_rl_index2 (tsn,vern_id),
   PRIMARY KEY (tsn,doc_id_prefix,documentation_id,vern_id))
   ENGINE=MyISAM CHARSET=latin1;
DROP TABLE IF EXISTS reference_links;
Create Table reference_links
 ( tsn INTEGER NOT NULL REFERENCES taxonomic_units,
   doc_id_prefix CHAR(3) NOT NULL,
   documentation_id INTEGER NOT NULL,
   original_desc_ind CHAR(1),
   init_itis_desc_ind CHAR(1),
   change_track_id INTEGER,
   vernacular_name VARCHAR(80),
   update_date DATE NOT NULL,
   INDEX reference_links_index (tsn,doc_id_prefix,documentation_id),
   PRIMARY KEY (tsn,doc_id_prefix,documentation_id))
   ENGINE=MyISAM CHARSET=latin1;
LOAD DATA LOCAL INFILE 'comments' INTO TABLE comments FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'experts' INTO TABLE experts FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'geographic_div' INTO TABLE geographic_div FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'jurisdiction' INTO TABLE jurisdiction FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'kingdoms' INTO TABLE kingdoms FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'longnames' INTO TABLE longnames FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'nodc_ids' INTO TABLE nodc_ids FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'other_sources' INTO TABLE other_sources FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'publications' INTO TABLE publications FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'strippedauthor' INTO TABLE strippedauthor FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'synonym_links' INTO TABLE synonym_links FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'taxon_authors_lkp' INTO TABLE taxon_authors_lkp FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'taxon_unit_types' INTO TABLE taxon_unit_types FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'taxonomic_units' INTO TABLE taxonomic_units FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'tu_comments_links' INTO TABLE tu_comments_links FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'vernaculars' INTO TABLE vernaculars FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'hierarchy' INTO TABLE hierarchy FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'reference_links' INTO TABLE reference_links FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
LOAD DATA LOCAL INFILE 'vern_ref_links' INTO TABLE vern_ref_links FIELDS TERMINATED BY '|' LINES TERMINATED BY '\n'; 
show databases;
show tables;
