import hashlib
import sqlite3

"""input_string = "molga1numarabİrsirketmidirevetöyledir!?admin"
hash_object = hashlib.sha512(input_string.encode())
hash_hex = hash_object.hexdigest()

print(hash_hex)"""

""""conn = sqlite3.connect('C:/Users/Tolga/Desktop/vqueue/vqueue/backend/kuyruk.db')
cursor = conn.cursor()
new_password_hash = '9a6785ef6a61bc1347f9d0242c8dd9bc5b8145da2158233c59f48101116acf853c265cae57da7137f778edc7e43dacd230ec05cf88038b18ed967d9de585dbd3'
old_password_hash = '797646f684c9251346d26f9e5ded4dd86f07035c9facf864e3b0d85f7e9eb6f935252b0142ad6a0b6d92092e18b74ce5acd5523d64ae7f676e2b82eefaf5da8f'
"""
#cursor.execute("""UPDATE admins SET password = ? WHERE username = 'admin' AND password = ? """, (new_password_hash, old_password_hash))
"""
conn.commit()
conn.close()"""
