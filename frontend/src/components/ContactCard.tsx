import React from 'react';

interface ContactCardProps {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export const ContactCard: React.FC<ContactCardProps> = ({
  primaryContatctId,
  emails,
  phoneNumbers,
  secondaryContactIds,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Consolidated Contact
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Primary Contact ID: {primaryContatctId}
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Emails</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="list-disc pl-5">
                {emails.map((email, idx) => (
                  <li key={idx}>{email}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Phone Numbers</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="list-disc pl-5">
                {phoneNumbers.map((phone, idx) => (
                  <li key={idx}>{phone}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Secondary Contact IDs</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {secondaryContactIds.length > 0 ? (
                <ul className="list-disc pl-5">
                  {secondaryContactIds.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              ) : (
                <span>None</span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};