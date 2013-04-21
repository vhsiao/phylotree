Wrote profile results to itis_sql_to_json.py.lprof
Timer unit: 1e-06 s

File: itis_sql_to_json.py
Function: dictify_database at line 161
Total time: 440.23 s

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
   161                                           @profile
   162                                           def dictify_database():
   163         1           72     72.0      0.0      all_tu_s = select([tu])
   164         1    440230210 440230210.0    100.0      all_tu_res = conn.execute(all_tu_s)
   165         2           46     23.0      0.0      for row in all_tu_res:
   166         2           50     25.0      0.0          child = Taxon(row)
   167         2            3      1.5      0.0          taxa[child.id] = child
   168         2            2      1.0      0.0          if (child.parent):
   169         1            6      6.0      0.0              taxa[child.parent].add_child(child.id) # Add all child_id to child id list in parent
   170         1            1      1.0      0.0          if(child.author_id):
   171                                                      child.year = authors[child.author_id]
   172                                                      # Add id/taxon mapping for child
   173                                                   else:
   174         1           31     31.0      0.0              sys.stderr.write("Warning: child {0} has no author data".format(child.id))

