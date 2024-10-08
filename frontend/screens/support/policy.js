import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const Policy = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={{ fontWeight: "bold" }}>
        Terms of Use and Privacy Policy for LaConnect App
      </Text>

      <View style={{ marginTop: 30 }} />
      <Text style={{ fontWeight: "500" }}>Terms of Use:</Text>
      <Text style={{ textAlign: "justify" }}>
        1. Acceptance of Terms: By using the LaConnect App ("the App"), you
        agree to these terms of use.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text style={{ textAlign: "justify" }}>
        2. App Purpose: The App is intended to connect skilled workers and
        employers, facilitating communication, job postings, and contract
        opportunities.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>3. User Obligations:</Text>
      <Text style={{ textAlign: "justify" }}>
        - Users must provide accurate and up-to-date information.
      </Text>
      <Text style={{ textAlign: "justify" }}>
        - Users shall not use the App for illegal or unauthorized purposes.
      </Text>
      <Text style={{ textAlign: "justify" }}>
        - Users shall not engage in any activity that disrupts or hinders the
        functioning of the App.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>4. Content Sharing:</Text>
      <Text style={{ textAlign: "justify" }}>
        - Users are responsible for the accuracy and legality of the content
        they share on the App.
      </Text>
      <Text style={{ textAlign: "justify" }}>
        - The Department of Labour does not endorse or verify the content shared
        by users.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>5. Privacy and Data Usage:</Text>
      <Text style={{ textAlign: "justify" }}>
        - User data will be collected and processed in accordance with the
        Privacy Policy outlined below.
      </Text>
      <Text style={{ textAlign: "justify" }}>
        - Users consent to the collection and use of their data as described in
        the Privacy Policy.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>6. Intellectual Property:</Text>
      <Text style={{ textAlign: "justify" }}>
        Users retain ownership of their content but grant the App a
        non-exclusive, royalty-free license to use, reproduce, and distribute
        the content.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>7. Liability Limitation:</Text>
      <Text style={{ textAlign: "justify" }}>
        - The Department of Labour is not liable for any damages arising from
        the use of the App.
      </Text>
      <Text style={{ textAlign: "justify" }}>
        - The App is provided "as is," and the Department of Labour makes no
        warranties regarding its performance.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>7. Modification of Terms:</Text>
      <Text style={{ textAlign: "justify" }}>
        The Department of Labour reserves the right to modify these terms of use
        at any time.
      </Text>

      <View style={{ marginTop: 10 }} />
      <Text>7. Termination:</Text>
      <Text style={{ textAlign: "justify" }}>
        The Department of Labour reserves the right to terminate or suspend
        users' access to the App for violating these terms.
      </Text>

      <Text style={{ marginTop: 20, fontWeight: "500" }}>Privacy Policy:</Text>
      <Text style={{ textAlign: "justify" }}>
        <Text style={{ fontWeight: "bold" }}>Data Collection:</Text>- The App
        collects user information, including but not limited to names, contact
        information, skills, and work preferences. - Usage data, device
        information, and IP addresses may also be collected.
        <Text style={{ fontWeight: "bold" }}>Data Usage:</Text>- User data is
        used to facilitate communication and interaction between skilled workers
        and employers. - Data may be used to improve the App's functionality and
        user experience.
        <Text style={{ fontWeight: "bold" }}>Data Sharing:</Text>- User data
        will not be shared with third parties without user consent, except as
        required by law.
        <Text style={{ fontWeight: "bold" }}>Security:</Text>- Appropriate
        security measures are implemented to protect user data from unauthorized
        access.
        <Text style={{ fontWeight: "bold" }}>Cookies and Tracking:</Text>- The
        App may use cookies and similar technologies to enhance user experience
        and gather usage information.
        <Text style={{ fontWeight: "bold" }}>Third-Party Links:</Text>- The App
        may contain links to third-party websites. This Privacy Policy does not
        cover those websites; users should review their privacy policies.
        <Text style={{ fontWeight: "bold" }}>Access and Control:</Text>- Users
        can access and update their personal information within the App. - Users
        can request the deletion of their account and associated data.
        <Text style={{ fontWeight: "bold" }}>Children's Privacy:</Text>- The App
        is not intended for children under the age of 13. If the Department of
        Labour becomes aware of collecting data from children, it will take
        appropriate steps to delete the information.
        <Text style={{ fontWeight: "bold" }}>Contact Information:</Text>- For
        questions or concerns about privacy, users can contact the Department of
        Labour at https://www.moice.gov.bt/.
      </Text>
    </ScrollView>
  );
};

const privacyPolicyContent = `
  **Privacy Policy:**

  1. **Data Collection:**
     - The App collects user information, including but not limited to names, contact information, skills, and work preferences.
     - Usage data, device information, and IP addresses may also be collected.

  2. **Data Usage:**
     - User data is used to facilitate communication and interaction between skilled workers and employers.
     - Data may be used to improve the App's functionality and user experience.

  3. **Data Sharing:**
     - User data will not be shared with third parties without user consent, except as required by law.

  4. **Security:**
     - Appropriate security measures are implemented to protect user data from unauthorized access.

  5. **Cookies and Tracking:**
     - The App may use cookies and similar technologies to enhance user experience and gather usage information.

  6. **Third-Party Links:**
     - The App may contain links to third-party websites. This Privacy Policy does not cover those websites; users should review their privacy policies.

  7. **Access and Control:**
     - Users can access and update their personal information within the App.
     - Users can request the deletion of their account and associated data.

  8. **Children's Privacy:**
     - The App is not intended for children under the age of 13. If the Department of Labour becomes aware of collecting data from children, it will take appropriate steps to delete the information.

  9. **Contact Information:**
     - For questions or concerns about privacy, users can contact the Department of Labour at https://www.moice.gov.bt/.
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    backgroundColor: "#fff",
  },
  content: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  policyText: {
    fontSize: 16,
  },
});

export default Policy;
